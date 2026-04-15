
const express = require("express");
const router = express.Router();

const Post = require("../models/Post");

// CREATE POST
router.post("/", async (req, res) => {
    try {
        const post = new Post(req.body);
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL POSTS
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET USER'S OWN POSTS
router.get("/my/:email", async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.email }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPVOTE A POST
router.put("/:id/upvote", async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { upvotes: 1 } },
            { new: true }
        );
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;