const Consumer = kafka.Consumer;
const consumer = new Consumer(client, [{ topic: 'user_notifications' }], { autoCommit: true });

consumer.on('message', async (message) => {
    const notificationData = JSON.parse(message.value);

    // Save to MongoDB
    const notification = await NotificationModel.create({
        userId: notificationData.userId,
        senderId: notificationData.senderId,
        type: notificationData.type,
        postId: notificationData.postId,
        message: notificationData.message,
    });

    // Send real-time notification via Socket.IO
    io.to(notification.userId).emit('notification', notification.message);

    // Update Redis Cache
    await performOperation(notification.userId + 'n', JSON.stringify(notification));
});
