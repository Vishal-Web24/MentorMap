const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["mentee", "mentor", "both"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, role } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: "Email already registered" });

      const user = await User.create({ name, email, password, role: role || "mentee" });
      res.status(201).json({ token: generateToken(user._id), user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password)))
        return res.status(401).json({ error: "Invalid email or password" });

      res.json({ token: generateToken(user._id), user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET/api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// PUT/api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.email;

    const user = await User.findByIdAndUpdate(req.user._id, { ...updates, isProfileComplete: true }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;