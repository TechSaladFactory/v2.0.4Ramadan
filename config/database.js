const mongoose = require("mongoose");

const db_connection = async () => {
  try {
    if (!process.env.DB_URL) {
      throw new Error("DB_URL is not defined in environment variables");
    }

    const connect = await mongoose.connect(process.env.DB_URL);
    console.log(`✅ DB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
  }
};

module.exports = db_connection;
