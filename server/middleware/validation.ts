import { NextFunction, Request, Response } from "express";
import * as validConst from "./validHelpers";

const { MAX_LENGTH_NAME, isInvalidAccount } = validConst;

const validRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, account, password } = req.body;
  const errors = [];

  if (!name) errors.push("Please add your name.");
  else if (name.length > MAX_LENGTH_NAME)
    errors.push("Your name is only up to 20 characters.");

  if (!account) errors.push("Please add your email or phone numbers.");
  else if (isInvalidAccount(account)) {
    errors.push("Email or phone numbers format is incorrect.");
  }
  
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }

  if (Array.isArray(errors) && errors.length > 0)
    return res.status(400).json({ message: errors });
  next();
};

export { validRegister };
