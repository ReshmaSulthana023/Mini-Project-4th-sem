// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        unique: true, 
        required: true,
        lowercase: true,
        match: [/.+@.+\..+/, "Please provide a valid email address"]
    },
    password: { type: String },
    googleId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);