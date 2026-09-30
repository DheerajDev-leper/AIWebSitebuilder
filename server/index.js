import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import connect from "./config/db.js";
import userRouter from "./routes/user.routes.js";
import websiteRouter from "./routes/website.routes.js";

dotenv.config();

const app = express();
connect();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/user",userRouter)
app.use("/api/website",websiteRouter)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});