const asyncHandler = require("express-async-handler");
const UserModel = require("../models/User.model");

const followUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const userToUnfollow = await UserModel.findById(userId);
    const currentUser = await UserModel.findOne(req.user._id);

    if (!userToUnfollow && !currentUser) {
        return res.status(404).json({ message: "User not found" });
    }


    if (userToUnfollow.followers.includes(currentUser._id)) {
        return res.status(400).json({ message: "User already follows the other user" });
    }

    userToUnfollow.followers.push(currentUser._id);
    currentUser.following.push(userToUnfollow._id);

    await userToUnfollow.save();
    await currentUser.save();
    res.status(200).json(`Followed ${userToUnfollow.username}`);

})

const unfollowUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const userToUnfollow = await UserModel.findById(userId);
    const currentUser = await UserModel.findOne(req.user._id);

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
    res.status(200).json(`Unfollowed ${userToUnfollow.username}`);

})

const getUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await UserModel.findById(userId).lean();
    const currentUser = await UserModel.findOne(req.user._id);
    
    if(!user){
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