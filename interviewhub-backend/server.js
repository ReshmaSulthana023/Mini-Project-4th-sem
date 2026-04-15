const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();

app.use(cors());
app.use(express.json());

require("./config/passport");
app.use(passport.initialize());

// Test endpoint
app.get("/api/test", (req, res) => {
    res.json({ msg: "Server is working" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("DB Error:", err));
    
app.listen(5000, () => console.log("Server running on port 5000"));

// app.get("/api", (req, res) => {
//     res.send("API is running 🚀");
// });