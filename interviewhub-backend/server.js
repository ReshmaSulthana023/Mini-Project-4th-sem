const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const PORT = process.env.PORT || 5000;
const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling for JSON parsing
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error("❌ JSON Parse Error:", err.message);
        return res.status(400).json({ error: "Invalid JSON format", details: err.message });
    }
    next();
});

require("./config/passport");
app.use(passport.initialize());

// Root endpoint
app.get("/", (req, res) => {
    res.json({ msg: "InterviewHub Backend Running ✅", port: PORT });
});

// Test endpoint
app.get("/api/test", (req, res) => {
    res.json({ msg: "Server is working" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
