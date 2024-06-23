const kafka = require('kafka-node');
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient();
const consumer = new Consumer(client, [{ topic: 'new_post' }, { topic: 'like_post' }, { topic: 'comment_post' }], { autoCommit: true });

consumer.on('message', (message) => {
  console.log('Kafka Consumer received message:', message);
  // Handle the message
});

consumer.on('error', (err) => {
  console.error('Kafka Consumer error:', err);
});

module.exports = consumer;
