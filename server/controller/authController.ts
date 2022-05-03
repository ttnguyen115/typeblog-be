import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { generateActiveToken } from "../config/generateToken";
import sendEmail from "../config/sendEmail";
import { validateEmail } from "../middleware/validHelpers";
import Users from "../models/userModel";

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
        sendEmail(account, url, "Verify your email address");
        return res.json({ msg: "Success! Please check your email" });
        return res.json({
          status: "OK",
          massage: "Registered successfully!",
          data: newUser,
          activeToken,
        });
      }
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },
};

export default authController;
