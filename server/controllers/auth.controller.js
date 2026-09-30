import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const googleAuth = async (req, res) => {
    try {

        const { name, email, avatar } = req.body;
        if ( !email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            const user = await User.create({ name, email, avatar });
            return res.status(201).json({ message: "User created successfully", user });
        }

        const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Set to true in production
            sameSite: "strict",
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        res.status(200).json({ message: "User logged in successfully", user: user, token });


    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token",{
            httpOnly:true,
            secure:false,
            sameSite:"strict"
        });
        res.status(200).json({ message: "User logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}