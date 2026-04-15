// backend/models/Post.js

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    company: String,
    role: String,
    type: String,
    difficulty: String,
    outcome: String,
    topics: [String],
    rounds: Number,
    roundDetails: String,
    questions: String,
    tips: String,
    postedBy: String,
    userId: String,
    upvotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);