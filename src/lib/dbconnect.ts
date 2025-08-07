import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "");
    connection.isConnected = db.connections[0].readyState;
    console.log("📦 Connected DB Name:", db.connections[0].name);
    console.log("DB Connected Successfully");
  } catch (error) {
    console.log("Error while connecting to Database0", error);

    process.exit(1);
  }
}

export default dbConnect;
