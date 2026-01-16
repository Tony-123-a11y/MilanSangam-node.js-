import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

export const connectDB = async () => {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URL);

      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return; // Exit the function after successful connection
    } catch (error) {
      attempts++;
      console.error(`❌ Attempt ${attempts} - Failed to connect: ${error.message}`);

      if (attempts < MAX_RETRIES) {
        console.log(`🔁 Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error(`❌ Max retries reached. Exiting...`);
        process.exit(1);
      }
    }
  }
};