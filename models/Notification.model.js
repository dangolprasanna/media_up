const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    type: { type: String, required: true }, 
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null},
    message: { type: String, required: true }, 
    read: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
