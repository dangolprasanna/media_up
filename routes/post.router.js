const express = require('express');
const { createPost, likePost, commentPost, getPosts, getLikes, getAllPostsByUser } = require('../controllers/post.controller');
const router = express.Router();
const { validateToken } = require('../middlewares/auth.middleware')
const rateLimiterMiddleware  = require('../middlewares/rateLimiter.middleware')

router.use(validateToken);

router.post("/create", createPost)
router.post("/:id/like", likePost)
router.post("/:id/comment", rateLimiterMiddleware, commentPost)
router.get("/all", getPosts);
router.get("/:id/getLikes", getLikes);
router.get("/:userId/getAllPosts", getAllPostsByUser)

module.exports = router;