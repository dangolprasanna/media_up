const redis = require("redis");
const performOperation = async (key, values, expiresIn = 3600) => {
  const client = redis.createClient();
  client.connect();
  try {
    await client.set(key, values, {
      EX: expiresIn
    });

    console.log(`Key: ${key} saved to redis`);
  } catch (error) {
    console.error("Error performing Redis operation", error);
  }
  process.on('SIGINT', async () => {
    await client.disconnect();
    process.exit();
  });
}

const fetchFromRedis = async (key) => {
  const client = redis.createClient();
  client.connect().catch(console.error);
  try {
    const value = await client.get(key);
    return value;
  } catch (error) {
    console.error("Error performing Redis operation", error);
  }
  process.on('SIGINT', async () => {
    await client.disconnect();
    process.exit();
  });
};

module.exports = { performOperation, fetchFromRedis };