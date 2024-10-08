const asyncHandler = require("express-async-handler");
const UserModel = require("../models/User.model");
const NotificationModel = require('../models/Notification.model')
const { performOperation } = require('../redis');
const { sendNotification } = require('../client');

const followUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (userId === req.user.id) {
        return res.status(400).json({ message: "User is trying to follow yourself" });
    }

    const userToFollow = await UserModel.findById(userId);
    const currentUser = await UserModel.findById(req.user.id);

    if (!userToFollow && !currentUser) {
        return res.status(404).json({ message: "User not found" });
    }

    if (userToFollow.followers.includes(currentUser._id)) {
        return res.status(400).json({ message: "User already follows the other user" });
    }

    userToFollow.followers.push(currentUser._id);
    currentUser.following.push(userToFollow._id);

    await userToFollow.save();
    await currentUser.save();

    await performOperation(currentUser._id.toString(), JSON.stringify(currentUser), 3600);
    const notification = await NotificationModel({
        userId: userToFollow._id,
        senderId: currentUser._id,
        type: 'follow',
        message: `${currentUser.username} has followed you`,
    });

    await notification.save();
    sendNotification(userToFollow._id, "send", `${currentUser.username} has followed you`);
    res.status(200).json(`Followed ${userToFollow.username}`);
})

const unfollowUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const userToUnfollow = await UserModel.findById(userId);
    const currentUser = await UserModel.findById(req.user.id);

    if (!userToUnfollow && !currentUser) {
        return res.status(404).json({ message: "User not found" });
    }

    if (!userToUnfollow.followers.includes(currentUser._id)) {
        return res.status(400).json({ message: "User doesn't follows the other user" });
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(follower => follower.toString() !== currentUser._id.toString());
    currentUser.following = currentUser.following.filter(follow => follow.toString() !== userToUnfollow._id.toString());

    await userToUnfollow.save();
    await currentUser.save();

    await NotificationModel.deleteOne({
        userId: userToUnfollow._id,
        senderId: currentUser._id,
        type: 'follow'
    });

    await performOperation(currentUser._id.toString(), JSON.stringify(currentUser), 3600);

    res.status(200).json(`Unfollowed ${userToUnfollow.username}`);

})

const getUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await UserModel.findById(userId).lean();
    const currentUser = await UserModel.findOne(req.user._id);

    if (!user) {
        res.status(404).json(`User doesn't exist`);
    }

    if (!currentUser.following.includes(user._id.toString())) {
        delete user.following;
        delete user.followers;
    }
    const { password, _id, __v, ...userWithoutSensitiveData } = user;
    res.status(200).json(userWithoutSensitiveData);

})

module.exports = { followUser, unfollowUser, getUser }