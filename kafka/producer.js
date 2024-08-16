const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER_URL });
const producer = new Producer(client);

const publishEventToKafka = (topic, message) => {
    const payloads = [{ topic, messages: JSON.stringify(message) }];
    producer.send(payloads, (err, data) => {
        if (err) {
            console.error('Failed to send message to Kafka', err);
        } else {
            console.log('Message sent to Kafka:', data);
        }
    });
};

// Example usage inside likePost:
publishEventToKafka('user_notifications', {
    userId: post.user,
    senderId: currentUser._id,
    type: 'like',
    postId: postId,
    message: `${currentUser.username} has liked ${post.content}`,
});
