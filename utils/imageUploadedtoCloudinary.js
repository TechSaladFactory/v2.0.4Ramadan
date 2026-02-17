const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const ApiErrors = require("../utils/apiErrors");
//const { height } = require('pdfkit/js/page');

async function uploadImage(req, foldername, next) {
  // التحقق إذا تم رفع صورة
  if (!req.file) {
    console.log("image are not uploaded cloudinary   statusCode: 400");

    return next(new ApiErrors(`image are not uploaded`, 404));;
  }

  // قائمة الأنواع المدعومة
  const allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const fileExtension = req.file.mimetype.split('/')[1];

  // التحقق من نوع الملف
  if (!allowedFormats.includes(fileExtension)) {
    console.log("image are must 'jpg,jpeg,png' cloudinary   statusCode: 400");

    return next(new ApiErrors(`image are must jpg png`, 404));;

  }

  // دالة لرفع الصورة إلى Cloudinary باستخدام الـ Buffer
  const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: foldername,
          quality: "auto:eco",
          fetch_format: "auto",
          transformation: [{width: 650, crop: "scale" }]

        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  };

  try {
    // رفع الصورة إلى Cloudinary
    const result = await streamUpload(req.file.buffer);

    console.log("image are uploaded to cloudinary   statusCode: 200");

    return result.secure_url;
  } catch (error) {
    console.error("Error Details: ", error); // طباعة تفاصيل الخطأ في الكونسول
    console.log("There was problem when image  uploaded    statusCode: 500");
    return next(new ApiErrors(`There was problem when image  uploaded `, 404));;

  }
}

module.exports = { uploadImage };
