import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { generateActiveToken } from "../config/generateToken";
import sendEmail from "../config/sendEmail";
import { sendSMS } from "../config/sendSMS";
import { validateEmail, validatePhone } from "../middleware/validHelpers";
import Users from "../models/userModel";
import { IDecodedToken } from "./../config/interface";

const CLIENT_URL = `${process.env.BASE_URL}`;

const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { name, account, password } = req.body;
      const user = await Users.findOne({ account });
      if (user)
        return res
          .status(400)
          .json({ message: "Email or Phone number already exists." });

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = {
        name,
        account,
        password: passwordHash,
      };
      const activeToken = generateActiveToken({ newUser });
      const url = `${CLIENT_URL}/active/${activeToken}`;
      if (validateEmail(account)) {
        console.log("hi");
        sendEmail(account, url, "Verify your email address");
        return res.json({ msg: "Success! Please check your email" });
        return res.json({
          status: "OK",
          massage: "Registered successfully!",
          data: newUser,
          activeToken,
        });
      } else if (validatePhone(account)) {
        console.log("hello");
        sendSMS(account, url, "Verify your phone numbers");
        return res.json({ msg: "Success! Please check phone" });
      }
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  activeAccount: async (req: Request, res: Response) => {
    try {
      const { activeToken } = req.body;
      const decoded = <IDecodedToken>(
        jwt.verify(activeToken, `${process.env.ACTIVE_TOKEN_SECRET}`)
      );
      const { newUser } = decoded;
      if (!newUser)
        return res.status(400).json({ message: "Invalid authentication." });
      const user = new Users(newUser);
      await user.save();
      res.json({ message: "Account has been activated!" });
    } catch (err: any) {
      let errMsg;
      if (err.code = 11000) {
        errMsg = Object.keys(err.keyValue)[0] + " already exists.";
      } else {
        let name = Object.keys(err.errors)[0];
        errMsg = err.errors[`${name}`].message;
      }
      return res.status(500).json({ message: errMsg });
    }
  },
};

export default authController;
