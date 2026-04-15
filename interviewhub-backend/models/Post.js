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
    upvotedBy: { type: [String], default: [] }
});

module.exports = mongoose.model("Post", postSchema);