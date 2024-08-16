const asyncHandler = require('express-async-handler');
const PostModel = require('../models/Post.model');
const UserModel = require('../models/User.model');
const NotificationModel = require('../models/Notification.model')
const { performOperation, fetchFromRedis } = require('../redis');
const { sendNotification } = require('../client');

//create Post
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

    res.status(200).json({ post })
})

//like post
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
        sendNotification(post.user, "send", `${currentUser.username} has liked ${post.content}`);

        const notification = await NotificationModel({
            userId: post.user,
            senderId: currentUser._id,
            type: 'like',
            postId: postId,
            message: `${currentUser.username} has liked ${post.content}`,
        });

        await notification.save();

    }
    await post.save();
    await performOperation(postId, data.toString());
})

//commentPost
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

    await performOperation(postId, JSON.stringify(post))

    sendNotification(post.user, "send", `${currentUser.username} has commented ${comment.content} on ${post.content}`);
    const notification = await NotificationModel({
        userId: post.user,
        senderId: currentUser._id,
        type: 'comment',
        postId: postId,
        message: `${currentUser.username} has commented ${comment.content} on ${post.content}`,
    });

    await notification.save();
    const userNotification = await NotificationModel.find({ userId: post.user    })
    performOperation(post.user + "n", JSON.stringify(userNotification))

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

const getComments = asyncHandler(async (req, res) => {
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
    let currentUser = await fetchFromRedis(req.user.id);
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

module.exports = { createPost, likePost, commentPost, getPosts, getLikes, getAllPostsByUser, getComments }