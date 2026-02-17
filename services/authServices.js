const ApiErrors = require("../utils/apiErrors");
const { UserModel } = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { default: slugify } = require("slugify");
const { createToken } = require("../utils/createToken");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { uploadImage } = require("../utils/imageUploadedtoCloudinary");
const {FailedLoginModel} = require("../models/failedLoginModel"); 
const levelModel=require("../models/levelModel")

const sendOTPConfirmEmail =require("../utils/sendOTPEmail")
const sendOTPDConfirmEmail =require("../utils/sendDevicesOTP")

//login
// exports.login = asyncHandler(async (req, res, next) => {
//   const { password ,Appversion} = req.body;

//   const userdata = await UserModel.findOne({ password });
//   if (userdata) {
//     const returnpassword = userdata.password;

//     const userIdcreated = await userdata._id;

//     // const isMatch = await bcrypt.compare(password, returnpassword);
//     const isMatch = password == returnpassword ? true : false;
//     if (isMatch) {
//       const token = await createToken(userIdcreated);
//       if (userdata.isVerified === true) {
//         await UserModel.findByIdAndUpdate(
//           { _id: userdata._id },
//           { lastLogin: Date.now(),Appversion:Appversion },
//           { new: true },
//         );
//         res.status(200).json({
//           message: "Login successfully !",
//           data: userdata,
//           status: 200,
//           token: token,
//         });
//       } else {
//         return next(new ApiErrors(`your Account is Not Active !`, 401));
//       }
//     } else {
//       return next(new ApiErrors(`The password is not correct !`, 404));
//     }
//   }
//   if (!userdata) {
//     return next(new ApiErrors("This account is not exist", 404));
//   }
// });

exports.login = asyncHandler(async (req, res, next) => {
  const { password, Appversion, deviceId, deviceName, fcmToken, lang } = req.body;

  if (!password) return next(new ApiErrors("Password is required!", 400));
  if (!deviceId || !deviceName) return next(new ApiErrors("Device info is required!", 400));

  // 1️⃣ سجل الفشل للجهاز
  let record = await FailedLoginModel.findOne({ deviceId, deviceName });

  // 2️⃣ فحص الحظر
  if (record?.isBlocked)
    return next(new ApiErrors("هذا الجهاز محظور بشكل دائم، راجع الإدارة", 403));

  // 3️⃣ البحث عن المستخدم
  const user = await UserModel.findOne({ password });

  // 4️⃣ المستخدم مش موجود → تسجيل محاولة فشل
  if (!user) {
    if (!record) record = new FailedLoginModel({ deviceId, deviceName, attempts: 1 });
    else record.attempts += 1;

    if (record.attempts >= 5) {
      record.isBlocked = true;
      record.attempts = 0;
    }

    await record.save();
    return next(new ApiErrors("This account does not exist", 404));
  }

  // 5️⃣ المستخدم موجود لكن غير مفعل
  if (!user.isVerified)
    return next(new ApiErrors("Your account is not active!", 401));

  // 6️⃣ تحقق الباسورد
  const isMatch = password === user.password;
  if (!isMatch) {
    if (!record) record = new FailedLoginModel({ deviceId, deviceName, attempts: 1 });
    else record.attempts += 1;

    if (record.attempts >= 5) {
      record.isBlocked = true;
      record.attempts = 0;
    }

    await record.save();
    return next(new ApiErrors("The password is not correct!", 404));
  }

  // 7️⃣ حذف سجل الفشل عند نجاح الدخول
  if (record && !record.isBlocked) {
    await FailedLoginModel.deleteOne({ deviceId, deviceName });
  }

  // 8️⃣ تحقق هل الجهاز موجود
  const existingDevice = user.devicelogin.find(d => d.deviceId === deviceId);

  if (!existingDevice) {
    // 🔐 جهاز جديد → OTP
    if (!user.email || !user.email.includes('@'))
      return res.status(200).json({ status: "email_required", message: "Please add your email first" });

    const code = Math.floor(100000 + Math.random() * 900000);
    user.verfiycode = code;
    user.verifyCodeExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOTPDConfirmEmail(
      user.email,
      code,
      "New Device Login",
      "Use this code to confirm login:"
    );

    return res.status(200).json({
      status: "verify_new_device",
      message: "OTP sent to your email"
    });
  }

  // 9️⃣ تحديث بيانات الدخول
  user.lastLogin = Date.now();
  user.isOnline = true;
  user.Appversion = Appversion;
  user.fcmToken = fcmToken;
  user.lang = lang;
  await user.save();

  // 10️⃣ إنشاء التوكن
  const token = await createToken(user._id);

  res.status(200).json({
    message: "Login successfully!",
    data: user,
    status: 200,
    token
  });
});


exports.addEmail = asyncHandler(async (req, res) => {
  const { userId, email } = req.body;

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const code = Math.floor(100000 + Math.random() * 900000);

  user.email = email;
  user.verfiycode = code;
  user.verifyCodeExpires = Date.now() + 5 * 60 * 1000;

  await user.save();

  await sendOTPConfirmEmail(email, code, "Verify Email", "Use this code:");

  res.json({ status: "verify_email" });
});

exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, code, deviceId, deviceName } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user)
    return res.status(404).json({ message: "User not found" });

  if (
    user.verfiycode != code ||
    user.verifyCodeExpires < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  // إضافة الجهاز لو مش موجود
  if (!user.devicelogin.some(d => d.deviceId === deviceId)) {
    user.devicelogin.push({
      deviceId,
      deviceName,
      addedAt: new Date()
    });
  }

  user.verfiycode = undefined;
  user.verifyCodeExpires = undefined;

  await user.save();

  const token = await createToken(user._id);

  res.json({ status: "success", token });
});





//protect
exports.protect = asyncHandler(async (req, res, next) => {
  if (req.headers.authorization === undefined) {
    return next(new ApiErrors("Headers does not have token !", 404));
  } else {
    const token = req.headers.authorization.split(" ")[1];

    if (token) {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userexist = await UserModel.findById({ _id: decoded.id });

      if (userexist) {
        if (userexist.passwordChangedAt) {
          const passwordChangedAtTime = parseInt(
            userexist.passwordChangedAt.getTime() / 1000,
            10,
          );
          if (passwordChangedAtTime > decoded.iat) {
            return next(
              new ApiErrors(
                "The user recently changed this password, Login again !",
                401,
              ),
            );
          } else {
            req.user = userexist;
            next();
          }
        } else {
          req.user = userexist;
          next();
        }
      }
      if (!userexist) {
        return next(
          new ApiErrors(
            "This user that belong to this token dosen't exist",
            401,
          ),
        );
      }
    } else {
      return next(new ApiErrors("You are not login to accsses ?", 401));
    }
  }
});

//permissions
exports.allwoedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log("You are not Allowed to accsses to this Route !");
      return next(
        new ApiErrors("You are not Allowed to accsses to this Route !", 403),
      );
    }
    next();
  });


exports.getuser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }

  const userData = await UserModel.findOne({ _id: decoded.id }).populate({
    path: "department",
    select: "name",
  });
  if (!userData) {
    return next(new ApiErrors(`User does not exist!`, 404));
  }

let nextLevel = await levelModel.findOne({
  levelPoint: { $gt: userData.pointsRLevel } 
}).sort({ levelPoint: 1 }).exec();

if (!nextLevel) {
  console.log("User reached highest level");
} else {
  console.log("Next Level:", nextLevel.levelName, nextLevel.levelPoint);
}


  res.status(200).json({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    nextLevel:nextLevel,
    currentpoints:userData.currentpoints,
    pointsRLevel:userData.pointsRLevel,
    profileImg: userData.profileImg,
    role: userData.role,
    department: userData.department,
    isVerified: userData.isVerified,
    updatedAt: userData.updatedAt,
    createdAt: userData.createdAt,
    lastLogin: userData.lastLogin,
    canAddProduct: userData.canAddProduct,
    canRemoveProduct: userData.canRemoveProduct,
    canaddProductIN:userData.canaddProductIN,
    canProduction:userData.canProduction,
    canOrderProduction:userData.canOrderProduction,
    canReceive:userData.canReceive,
    slug:userData.slug,
    canSend:userData.canSend,
    canSupply:userData.canSupply,
    canDamaged:  userData.canDamaged,
    canEditLastSupply:  userData.canEditLastSupply,
    canEditLastOrderProduction:  userData.canEditLastOrderProduction,
    canShowTawalf:userData.canShowTawalf,
    Appversion:userData.Appversion,
    canaddRezoCahser:userData.canaddRezoCahser,
    canshowRezoCahser:userData.canshowRezoCahser,
canshowCahserRezoPhoto:userData.canshowCahserRezoPhoto,

    canshowManageWalaa:userData.canshowManageWalaa,

canshowWalaa:userData.canshowWalaa,
  });
});

exports.getuserDepartment = asyncHandler(async (req, res, next) => {
  // تحقق من وجود Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }

  // جلب بيانات المستخدم من قاعدة البيانات
  const userData = await UserModel.findOne({ _id: decoded.id }).populate({
    path: "department",
    select: "name",
  });
  if (!userData) {
    return next(new ApiErrors(`User does not exist!`, 404));
  }

  res.status(200).json({
    data: userData.department,
  });
});

exports.getuserBranchOP = asyncHandler(async (req, res, next) => {
  // تحقق من وجود Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }

  // جلب بيانات المستخدم من قاعدة البيانات
  const userData = await UserModel.findOne({ _id: decoded.id }).populate({
    path: "branchesTo_OP",
    select: "name",
  });
  if (!userData) {
    return next(new ApiErrors(`User does not exist!`, 404));
  }

  res.status(200).json({
    data: userData.branchesTo_OP,
  });
});



exports.getuserBranchOS = asyncHandler(async (req, res, next) => {
  // تحقق من وجود Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }

  // جلب بيانات المستخدم من قاعدة البيانات
  const userData = await UserModel.findOne({ _id: decoded.id }).populate({
    path: "branchesTo_OS",
    select: "name",
  });
  if (!userData) {
    return next(new ApiErrors(`User does not exist!`, 404));
  }

  res.status(200).json({
    data: userData.branchesTo_OS,
  });
});

exports.getuserBranchtawalf = asyncHandler(async (req, res, next) => {
  // تحقق من وجود Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }

  // جلب بيانات المستخدم من قاعدة البيانات
  const userData = await UserModel.findOne({ _id: decoded.id }).populate({
    path: "branchesTo_Tawlf",
    select: "name",
  });
  if (!userData) {
    return next(new ApiErrors(`User does not exist!`, 404));
  }

  res.status(200).json({
    data: userData.branchesTo_Tawlf,
  });
});


//rezoCasher

exports.getuserBranchRezoCaher = asyncHandler(async (req, res, next) => {
  // تحقق من وجود Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiErrors(`Header must contain token!`, 404));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiErrors(`Invalid token: ${err.message}`, 401));
  }

  // جلب بيانات المستخدم من قاعدة البيانات
  const userData = await UserModel.findOne({ _id: decoded.id }).populate({
    path: "branchesTo_addRezoCasher",
    select: "name",
  });
  if (!userData) {
    return next(new ApiErrors(`User does not exist!`, 404));
  }

  res.status(200).json({
    data: userData.branchesTo_addRezoCasher,
  });
});


exports.sendEmailOTP =asyncHandler( async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const code = Math.floor(100000 + Math.random() * 900000); // 6 digits
    user.verfiycode = code;
user.verifyCodeExpires = Date.now() + 5 * 60 * 1000; 
    await user.save();

    await sendOTPConfirmEmail(email, code,"Verify Your Email","Use the following code to verify your email address:"); // تبعته على الإيميل

    res.status(200).json({ message: "Verification code sent to email",status:200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send code" });
  }
});

exports.verifyEmailOTP = asyncHandler( async (req, res) => {
 try {
    const { email, code } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      user.verfiycode !== Number(code) ||
      user.verifyCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Code invalid or expired" });
    }

    user.isVerified = true;
    user.verfiycode = 0;
    user.verifyCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" ,status:200});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
});