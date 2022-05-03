import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { generateActiveToken } from "../config/generateToken";
import Users from "../models/userModel";

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

      res.json({
        status: "OK",
        massage: "Registered successfully!",
        data: newUser,
        activeToken,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },
};

export default authController;
