const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient();
const producer = new Producer(client);

producer.on('ready', () => {
  console.log('Kafka Producer is connected and ready.');
});

producer.on('error', (err) => {
  console.error('Kafka Producer error:', err);
});

const sendEvent = (topic, message) => {
  const payloads = [{ topic, messages: JSON.stringify(message) }];
  producer.send(payloads, (err, data) => {
    if (err) console.error('Kafka Producer send error:', err);
  });
};

module.exports = { sendEvent };