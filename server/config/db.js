import mongoose from "mongoose";

const connectDB = async (retries = 5) => {
  while (retries > 0) {
    try {
      console.log(`Connecting to MongoDB... (Retries left: ${retries})`);
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`Connected to MongoDB successfully: ${conn.connection.host} ✅`);
      return;
    } catch (error) {
      console.error("❌ MongoDB Connection Error:", error.message);
      retries -= 1;
      if (retries === 0) throw error;
      console.log("Retrying in 5 seconds...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

export default connectDB;
