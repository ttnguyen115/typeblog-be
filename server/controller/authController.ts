import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
// import { RequestInfo, RequestInit } from "node-fetch";
import fetch from "cross-fetch";
import { generateActiveToken } from "../config/generateToken";
import sendEmail from "../config/sendEmail";
import { sendSMS } from "../config/sendSMS";
import { validateEmail, validatePhone } from "../middleware/validHelpers";
import Users from "../models/userModel";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./../config/generateToken";
import {
  IDecodedToken,
  IGgPayload,
  IUser,
  IUserParams,
} from "./../config/interface";

// const fetch = (url: RequestInfo, init?: RequestInit) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(url, init));
const client = new OAuth2Client(`${process.env.MAIL_CLIENT_ID}`);
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
        // return res.json({
        //   status: "OK",
        //   massage: "Registered successfully!",
        //   data: newUser,
        //   activeToken,
        // });
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

      const user = await Users.findOne({ account: newUser.account });
      if (user) return res.status(400).json({ msg: "Account already exists." });

      const new_user = new Users(newUser);
      await new_user.save();
      res.json({ message: "Account has been activated!" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { account, password } = req.body;
      const user = await Users.findOne({ account });
      if (!user)
        return res
          .status(400)
          .json({ message: "This account does not exist." });
      // if user exists
      loginUser(user, password, res);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  googleLogin: async (req: Request, res: Response) => {
    try {
      const { id_token } = req.body;
      const verify = await client.verifyIdToken({
        idToken: id_token,
        audience: `${process.env.MAIL_CLIENT_ID}`,
      });
      const { email, email_verified, name, picture } = <IGgPayload>(
        verify.getPayload()
      );
      if (!email_verified)
        return res.status(500).json({ msg: "Email verification failed." });

      const password = email + "your google secret password";
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await Users.findOne({ account: email });
      if (user) {
        loginUser(user, password, res);
      } else {
        const user = {
          name,
          account: email,
          password: passwordHash,
          avatar: picture,
          type: "login",
        };
        registerUser(user, res);
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },

  facebookLogin: async (req: Request, res: Response) => {
    try {
      const { accessToken, userID } = req.body;
      const URL = `https://graph.facebook.com/v3.0/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;
      const data = await fetch(URL)
        .then((res) => res.json())
        .then((res) => {
          return res;
        });
      const { id, email, name, picture } = data;
      const password = email + "your facebook secret password";
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await Users.findOne({ account: email });
      if (user) {
        loginUser(user, password, res);
      } else {
        const user = {
          name,
          account: email,
          password: passwordHash,
          avatar: picture.data.url,
          type: "login",
        };
        registerUser(user, res);
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      res.clearCookie("refreshtoken", {
        path: "/api/refresh_token",
      });
      return res.json({ message: "Logout successfully" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies["refreshtoken"];
      if (!refreshToken)
        return res.status(400).json({ message: "Please login now!" });
      const decoded = <IDecodedToken>(
        jwt.verify(refreshToken, `${process.env.REFRESH_TOKEN_SECRET}`)
      );
      if (!decoded.id)
        return res.status(400).json({ message: "Please login now!" });
      // If passed
      const user = await Users.findById(decoded.id).select("-password");
      if (!user)
        return res
          .status(400)
          .json({ message: "This account does not exist." });

      const accessToken = generateAccessToken({ id: user._id });

      res.json({
        accessToken,
        user,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },
};

const loginUser = async (user: IUser, password: string, res: Response) => {
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(500).json({ message: "Password is incorrect." });

  const accessToken = generateAccessToken({ id: user._id });
  const refreshToken = generateRefreshToken({ id: user._id });

  res.cookie("refreshtoken", refreshToken, {
    httpOnly: true,
    path: "/api/refresh_token",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.json({
    message: "Login Successfully",
    accessToken,
    user: { ...user._doc, password: "" }, // hide password when return json data
  });
};

const registerUser = async (user: IUserParams, res: Response) => {
  const newUser = new Users(user);
  await newUser.save();

  const accessToken = generateAccessToken({ id: newUser._id });
  const refreshToken = generateRefreshToken({ id: newUser._id });

  res.cookie("refreshtoken", refreshToken, {
    httpOnly: true,
    path: "/api/refresh_token",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.json({
    message: "Login Successfully",
    accessToken,
    user: { ...newUser._doc, password: "" }, // hide password when return json data
  });
};

export default authController;
