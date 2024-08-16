const asyncHandler = require('express-async-handler');
const NotificationModel = require('../models/Notification.model')
const { performOperation, fetchFromRedis } = require('../redis')

const getNotification = asyncHandler(async (req, res) => {
    let userNotification = await fetchFromRedis(req.user.id + "n")

    if (!userNotification) {
        userNotification = await NotificationModel.find({ userId: req.user.id })
        performOperation(req.user.id + "n", JSON.stringify(userNotification))
    }

    //update all the notification read to true
    await NotificationModel.updateMany(
        { userId: req.user.id, read: false },
        { $set: { read: true } }
    );
    res.status(200).json(JSON.parse(userNotification));
})

module.exports = { getNotification }