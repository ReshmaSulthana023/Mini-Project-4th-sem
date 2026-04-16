// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
<<<<<<< HEAD
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
=======
    name: String,
    email: { type: String, unique: true },
    password: String,
    googleId: String
>>>>>>> d934338a2f8ea1efffb6dedd1e77b79451624a72
});

module.exports = mongoose.model("User", userSchema);