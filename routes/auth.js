import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ msg: "Invalid password" });
    }
    const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

export default router;