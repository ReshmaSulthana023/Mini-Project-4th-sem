
const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const Post = require("../models/Post");
const { verifyToken } = require("../middleware/auth");

// CREATE POST (requires authentication)
router.post("/", verifyToken, async (req, res) => {
    try {
        // Ensure userId is set from authenticated user - MUST be email
        if (!req.user.email) {
            return res.status(400).json({ msg: "User email is required. Please log in again." });
        }

        const postData = {
            ...req.body,
            userId: req.user.email.toLowerCase(),  // Normalize to lowercase
            postedBy: req.user.name || "Anonymous"
        };
        
        const post = new Post(postData);
        await post.save();
        res.json({ msg: "Post created successfully", post });
=======

const Post = require("../models/Post");

// CREATE POST
router.post("/", async (req, res) => {
    try {
        const post = new Post(req.body);
        await post.save();
        res.json(post);
>>>>>>> d934338a2f8ea1efffb6dedd1e77b79451624a72
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

<<<<<<< HEAD
// GET ALL POSTS (public)
=======
// GET ALL POSTS
>>>>>>> d934338a2f8ea1efffb6dedd1e77b79451624a72
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

<<<<<<< HEAD
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

// UPDATE POST (only by creator)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // Check if user is the creator (case-insensitive)
        const userEmail = req.user.email.toLowerCase();
        const postUserId = post.userId.toLowerCase();
        
        if (postUserId !== userEmail) {
            return res.status(403).json({ msg: "You can only edit your own posts" });
        }

        // Update only allowed fields
        const allowedUpdates = [
            "company", "role", "type", "difficulty", "outcome",
            "topics", "rounds", "roundDetails", "questions", "tips"
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                post[field] = req.body[field];
            }
        });

        await post.save();
        res.json({ msg: "Post updated successfully", post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE POST (only by creator)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // Check if user is the creator (case-insensitive)
        const userEmail = req.user.email.toLowerCase();
        const postUserId = post.userId.toLowerCase();
        
        if (postUserId !== userEmail) {
            return res.status(403).json({ msg: "You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ msg: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPVOTE/UNUPVOTE A POST (toggle)
router.put("/:id/upvote", async (req, res) => {
    try {
        const userEmail = req.query.email || req.body.email || "anonymous";
        
        const post = await Post.findById(req.params.id);
=======
// UPVOTE A POST
router.put("/:id/upvote", async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ msg: "User ID missing" });
        }

        const post = await Post.findById(req.params.id);

>>>>>>> d934338a2f8ea1efffb6dedd1e77b79451624a72
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

<<<<<<< HEAD
        const hasUpvoted = post.upvotedBy && post.upvotedBy.includes(userEmail);

        let updatedPost;
        if (hasUpvoted) {
            // Remove upvote (unupvote)
            updatedPost = await Post.findByIdAndUpdate(
                req.params.id,
                { 
                    $inc: { upvotes: -1 },
                    $pull: { upvotedBy: userEmail }
                },
                { new: true }
            );
            res.json({ msg: "Upvote removed", post: updatedPost, upvoted: false });
        } else {
            // Add upvote
            updatedPost = await Post.findByIdAndUpdate(
                req.params.id,
                { 
                    $inc: { upvotes: 1 },
                    $push: { upvotedBy: userEmail }
                },
                { new: true }
            );
            res.json({ msg: "Upvoted successfully", post: updatedPost, upvoted: true });
        }
    } catch (err) {
=======
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
>>>>>>> d934338a2f8ea1efffb6dedd1e77b79451624a72
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;