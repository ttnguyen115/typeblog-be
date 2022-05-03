import { NextFunction, Request, Response } from "express";
import * as validConst from "./validHelpers";

const { MAX_LENGTH_NAME, isInvalidAccount } = validConst;

const validRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, account, password } = req.body;

  if (!name) return res.status(400).json({ message: "Please add your name." });
  else if (name.length > MAX_LENGTH_NAME)
    return res
      .status(400)
      .json({ message: "Your name is only up to 20 characters." });

  if (!account)
    return res
      .status(400)
      .json({ message: "Please add your email or phone numbers." });
  else if (isInvalidAccount(account))
    return res
      .status(400)
      .json({ message: "Email or phone numbers format is incorrect." });

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  next();
};

export { validRegister };
