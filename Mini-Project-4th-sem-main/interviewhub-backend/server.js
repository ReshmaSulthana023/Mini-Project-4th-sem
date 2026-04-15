const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");

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

mongoose.connect("mongodb://myAtlasDBUser:myatlas123@ac-kfj5pnm-shard-00-00.1lbbfol.mongodb.net:27017,ac-kfj5pnm-shard-00-01.1lbbfol.mongodb.net:27017,ac-kfj5pnm-shard-00-02.1lbbfol.mongodb.net:27017/?ssl=true&replicaSet=atlas-huyyvf-shard-0&authSource=admin&appName=myAtlasClusterEDU")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("DB Error:", err));
    
app.listen(5000, () => console.log("Server running on port 5000"));