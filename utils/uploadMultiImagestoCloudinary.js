const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const ApiErrors = require("../utils/apiErrors");

async function uploadMutliImages(req, foldername, next) {
  // التحقق إذا تم رفع صور
  if (!req.files || req.files.length === 0) {
    console.log("images are not uploaded cloudinary   statusCode: 400");
  //  return next(new ApiErrors(`images are not uploaded`, 404));
  }

  // قائمة الأنواع المدعومة
  const allowedFormats = ['jpg', 'jpeg', 'png'];
  const uploadPromises = req.files.map(file => {
    const fileExtension = file.mimetype.split('/')[1];

    // التحقق من نوع الملف
    if (!allowedFormats.includes(fileExtension)) {
      console.log("images must be 'jpg, jpeg, png' cloudinary   statusCode: 400");
    //  return Promise.reject(new ApiErrors(`images must be jpg, jpeg, or png`, 404));
    }

    // دالة لرفع الصورة إلى Cloudinary باستخدام الـ Buffer
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: foldername,
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

    return streamUpload(file.buffer)
      .then(result => result.secure_url)
      .catch(error => {
        console.error("Error Details: ", error); // طباعة تفاصيل الخطأ في الكونسول
      //  return Promise.reject(new ApiErrors(`There was a problem uploading images`, 500));
      });
  });

  try {
    const resultUrls = await Promise.all(uploadPromises);
    console.log("images are uploaded to cloudinary   statusCode: 200");
    return resultUrls; // إرجاع جميع الروابط المؤمنة للصور
  } catch (error) {
    console.error("Error Details: ", error);
    console.log("There was a problem when Multiimages were uploaded    statusCode: 500");
  //  return next(new ApiErrors(`There was a problem uploading images`, 500));
  }
}

module.exports = { uploadMutliImages };
