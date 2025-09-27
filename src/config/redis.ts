import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect()
  .then(() => console.log('Redis connected'))
  .catch((err) => console.error('Redis connection error:', err));

export default redisClient;
