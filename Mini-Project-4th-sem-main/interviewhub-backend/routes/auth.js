const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const passport = require("passport");

const router = express.Router();
const JWT_SECRET = "your-secret-key-change-this";

// ===== SIGNUP =====
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        if (!password || password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Create JWT token for auto-login after signup
        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            msg: "User registered successfully",
            token,
            user: { name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== LOGIN =====
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: { name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== GOOGLE AUTH =====
router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, name: req.user.name, email: req.user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.redirect(`http://localhost:3000/?token=${token}&name=${req.user.name}&email=${req.user.email}`);
    }
);

module.exports = router;