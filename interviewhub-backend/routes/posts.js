
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { verifyToken } = require("../middleware/auth");

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

// GET SINGLE POST
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPVOTE A POST
router.put("/:id/upvote", async (req, res) => {
    try {
        const userEmail = req.query.email || req.body.email || "anonymous";

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // Prevent users from upvoting their own posts
        if (post.userId && post.userId.toLowerCase() === userEmail.toLowerCase()) {
            return res.status(403).json({ msg: "You cannot upvote your own post" });
        }

        // ensure array exists
        if (!post.upvotedBy) {
            post.upvotedBy = [];
        }

        // TOGGLE LOGIC
        if (post.upvotedBy.includes(userEmail)) {
            // already upvoted → REMOVE
            post.upvotes -= 1;
            post.upvotedBy = post.upvotedBy.filter(u => u !== userEmail);
        } else {
            // not upvoted → ADD
            post.upvotes += 1;
            post.upvotedBy.push(userEmail);
        }

        await post.save();

        res.json(post);

    } catch (err) {
        console.error("UPVOTE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE A POST
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // Verify ownership - user can only edit their own posts
        if (post.userId !== req.user.email) {
            return res.status(403).json({ msg: "You can only edit your own posts" });
        }

        // Update fields
        post.company = req.body.company || post.company;
        post.role = req.body.role || post.role;
        post.type = req.body.type || post.type;
        post.difficulty = req.body.difficulty || post.difficulty;
        post.outcome = req.body.outcome || post.outcome;
        post.topics = req.body.topics || post.topics;
        post.rounds = req.body.rounds || post.rounds;
        post.roundDetails = req.body.roundDetails || post.roundDetails;
        post.questions = req.body.questions || post.questions;
        post.tips = req.body.tips || post.tips;

        await post.save();
        res.json(post);

    } catch (err) {
        console.error("UPDATE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE A POST
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // Verify ownership - user can only delete their own posts
        if (post.userId !== req.user.email) {
            return res.status(403).json({ msg: "You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ msg: "Post deleted successfully" });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;