import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB");
};

export default connect;