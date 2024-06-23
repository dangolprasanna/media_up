const asyncHandler = require('express-async-handler');
const PostModel = require('../models/Post.model');
const UserModel = require('../models/User.model');
// const {sendEvent} = require('../kafka/producer')

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
    if (post.like.includes(currentUser._id)) {
        post.likes = post.like.filter(like => like.toString() !== req.user.id.toString());
        res.status(200).send(`${currentUser.username} has already liked the post`)
    } else {
        post.like.push(currentUser._id.toString());
        res.status(200).send(`${currentUser.username} liked the post`)
    }
    await post.save();
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
    // const currentUser = await UserModel.findById(req.user.id);
    const posts = await PostModel.find({
        user: req.user.id
    });
    res.status(200).json(posts);
})

module.exports = { createPost, likePost, commentPost, getPosts }