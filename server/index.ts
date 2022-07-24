import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";

import routes from "./routes";

// Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.use("/api", routes.authRouter);

// Database
import "./config/database";

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is running on port: ", PORT);
});
