const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.query.token;
        
        if (!token) {
            return res.status(401).json({ msg: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Invalid or expired token" });
    }
};

module.exports = { verifyToken };
