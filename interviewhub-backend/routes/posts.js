
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
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ msg: "User ID missing" });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // 🔥 ensure array exists
        if (!post.upvotedBy) {
            post.upvotedBy = [];
        }

        // 🔁 TOGGLE LOGIC
        if (post.upvotedBy.includes(userId)) {
            // ❌ already upvoted → REMOVE
            post.upvotes -= 1;
            post.upvotedBy = post.upvotedBy.filter(u => u !== userId);
        } else {
            // ✅ not upvoted → ADD
            post.upvotes += 1;
            post.upvotedBy.push(userId);
        }

        await post.save();

        res.json(post);

    } catch (err) {
        console.error("UPVOTE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;