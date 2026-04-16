const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();

// Middleware
app.use(cors({
    origin: ["http://localhost:5000", "http://localhost:8080", "http://localhost:3000", "*"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
const frontendPath = path.join(__dirname, "../Mini-Project-4th-sem-main");
app.use(express.static(frontendPath));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || "session-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Passport configuration
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// Root route - serve landing page
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "landpage.html"));
});

// Test endpoint
app.get("/api/test", (req, res) => {
    res.json({ msg: "Server is working ✅" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});

// MongoDB Connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI not defined in .env file");
        }

        await mongoose.connect(mongoUri);
        console.log("✅ MongoDB Connected successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
};

// Connect to DB and start server
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 Frontend at http://localhost:${PORT}`);
        console.log(`📝 API available at http://localhost:${PORT}/api`);
        console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test\n`);
    });
}).catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});