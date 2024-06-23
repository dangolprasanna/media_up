const express = require('express');
const { createPost, likePost, commentPost, getPosts } = require('../controllers/post.controller');
const router = express.Router();
const { validateToken } = require('../middlewares/auth.middleware')

router.use(validateToken);

router.post("/create", createPost)
router.post("/:id/like", likePost)
router.post("/:id/comment", commentPost)
router.get("/all", getPosts);

module.exports = router;