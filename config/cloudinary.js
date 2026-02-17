const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const cloudinary_connection = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME, 
      api_key: process.env.API_CLOUDINARY, 
      api_secret: process.env.API_SECRET
    });

    // إذا تم الاتصال بنجاح
    console.log("Cloudinary connection is successfully !");
 
  } catch (error) {
    // في حال حدوث خطأ أثناء الاتصال
    console.error("Error connecting to Cloudinary:", error.message);
  }
}

module.exports = cloudinary_connection;
