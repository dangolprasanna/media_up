const asyncHandler = require('express-async-handler');
const PostModel = require('../models/Post.model');
const UserModel = require('../models/User.model');
const { performOperation, fetchFromRedis } = require('../redis');

const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        res.body(400).json({ message: "No user or Content" })
    }
    const currentUser = await UserModel.findById(req.user.id);
    const user = currentUser._id;
    const post = await PostModel.create({
        user,
        content
    })

    // sendEvent('new_post', post); 
    res.status(200).json({ post })
})

const likePost = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const post = await PostModel.findById(postId);
    const currentUser = await UserModel.findById(req.user.id);
    if (!post) {
        res.status(400).json({ message: 'Post does not exist' });
    }
    const data = post.like;

    if (post.like.includes(currentUser._id)) {
        post.likes = post.like.filter(like => like.toString() !== req.user.id.toString());
        res.status(200).send(`${currentUser.username} has already liked the post`)
    } else {
        post.like.push(currentUser._id.toString());
        res.status(200).send(`${currentUser.username} liked the post`)
    }
    await post.save();

    await performOperation(postId, data.toString());
})

const commentPost = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const post = await PostModel.findById(postId);
    const currentUser = await UserModel.findById(req.user.id);
    const comment = {
        user: currentUser._id,
        content: req.body.content,
    };

    if (!post) {
        res.status(400).json({ message: 'Post does not exist' });
    }

    post.comments.push(comment);
    await post.save();
    res.status(200).json({ post });
})

const getPosts = asyncHandler(async (req, res) => {
    const posts = await PostModel.find({
        user: req.user.id
    });
    res.status(200).json(posts);
})

const getLikes = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    let likedBy = await fetchFromRedis(postId);
    if (!likedBy) {
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(400).json({ message: 'Post does not exist' });
        }
        likedBy = post.like;
        await performOperation(postId, JSON.stringify(likedBy));
    }
    res.status(200).json({ likes: likedBy })
})

const getAllPostsByUser = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    let currentUser = await client.get("currentUser");
    currentUser = JSON.parse(currentUser);

    if (currentUser.following.includes(userId)) {
        const posts = await PostModel.find({
            user: req.user.id
        });
        res.status(200).json(posts);
    }
    else {
        res.status(404).json({ message: "Please follow the user" });
    }

})

module.exports = { createPost, likePost, commentPost, getPosts, getLikes, getAllPostsByUser }