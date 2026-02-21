const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const walaaHistoryModel = require("../models/walaaHistoryModel");
const { UserModel } = require("../models/userModel");
const { sendNotification } = require("../utils/notificationService");

/* ================== HELPERS ================== */
const safeNotify = async (token, title, body, data = {}) => {
  try {
    if (token) {
      await sendNotification(token, title, body, data);
    }
  } catch (err) {
    console.error("FCM Error:", err.message);
  }
};

const getTokenUser = (req) => {
  if (!req.headers.authorization) {
    throw new ApiErrors("Headers does not have token!", 401);
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    throw new ApiErrors("Token missing in authorization header", 401);
  }
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

/* ================== CREATE ================== */
exports.createWalaaHistory = asyncHandler(async (req, res, next) => {
  const { title, status, reason, points, rate, place, language } = req.body;
  const lang = language || "en";

  const decoded = getTokenUser(req);
  const user = await UserModel.findById(decoded.id);
  if (!user) return next(new ApiErrors("User not found", 404));

  const walaaHistory = await walaaHistoryModel.create({
    title,
    status,
    place,
    reason,
    points,
    userId: decoded.id,
    rate,
  });

  const notificationTitle =
    lang === "ar" ? "تم تسجيل نشاط جديد" : "New Activity Recorded";
  const notificationBody =
    lang === "ar"
      ? `تم ${status} مقابل ${points} نقطة`
      : `Your order has been ${status} for ${points} points`;

  await safeNotify(user.fcmToken, notificationTitle, notificationBody, {
    type: "walaa_history_created",
    walaaId: walaaHistory._id.toString(),
    points: points.toString(),
    status,
  });

  res.status(200).json({ status: 200, data: walaaHistory });
});

/* ================== SET POINTS ================== */
exports.setPointsWalaaHistory = asyncHandler(async (req, res, next) => {
  let { title, status, reason, points, rate, place, userId, approved } = req.body;

  const user = await UserModel.findById(userId);
  if (!user) return next(new ApiErrors("User not found", 404));

  const lang = user.lang;
  const isDeduction = points < 0;

  /** =========================
   * تعيين place حسب الاعتماد
   ========================= */
  place = approved === true ? place || "r" : "p";

  /** =========================
   * إنشاء السجل
   ========================= */
  const walaaHistory = await walaaHistoryModel.create({
    title,
    status,
    place,
    reason,
    points,
    rate,
    collect: isDeduction,
    userId,
    approved: approved === true
  });

  /** =========================
   * لو غير معتمد → لا تنفيذ النقاط ولا إشعار
   ========================= */
  if (approved !== true) {
    return res.status(200).json({
      status: 200,
      message: "Operation saved but waiting for approval",
      data: walaaHistory,
      currentPoints: user.currentpoints
    });
  }

  /** =========================
   * تنفيذ العملية فورًا
   ========================= */
  if (isDeduction) {
    user.currentpoints = Math.max(0, user.currentpoints + points);
  } else {
    user.currentpoints += points;
    // user.pointsRLevel += points; // لو حابب تفعلها
  }

  await user.save();

  /** =========================
   * تجهيز الإشعار
   ========================= */
  const notificationTitle = isDeduction
    ? (lang === 'ar' ? "تم خصم النقاط" : "Points Deducted")
    : (lang === 'ar' ? "تم إضافة النقاط" : "Points Added");

  const notificationBody = isDeduction
    ? (lang === 'ar'
        ? `${Math.abs(points)} نقطة تم خصمها من حسابك`
        : `${Math.abs(points)} points have been deducted from your account`)
    : (lang === 'ar'
        ? `لقد تم إضافة ${points} نقطة إلى حسابك!`
        : `You have received ${points} points!`);

  /** =========================
   * إرسال الإشعار
   ========================= */
  if (user.fcmToken) {
    try {
      await sendNotification(
        user.fcmToken,
        notificationTitle,
        lang === 'ar'
          ? `${user.name}, ${notificationBody}`
          : `${user.slug}, ${notificationBody}`,
        {
          type: isDeduction ? 'points_deducted' : 'points_added',
          walaaId: walaaHistory._id.toString(),
          points: points.toString(),
          currentPoints: user.currentpoints.toString()
        },
        lang
      );
    } catch (err) {
      console.warn("Notification failed:", err.message);
    }
  }

  return res.status(200).json({
    status: 200,
    data: walaaHistory,
    currentPoints: user.currentpoints
  });
});

/* ================== REDEEM ================== */
exports.makeRedeem = asyncHandler(async (req, res, next) => {
  const { title, status, reason, points, rate, place, language } = req.body;
  const lang = language || "en";

  const decoded = getTokenUser(req);
  const user = await UserModel.findById(decoded.id);
  if (!user) return next(new ApiErrors("User not found", 404));

  if (points > user.currentpoints) {
    return next(new ApiErrors("Not enough points", 400));
  }

  user.currentpoints -= points;
  await user.save();

  const walaaHistory = await walaaHistoryModel.create({
    title,
    status,
    reason,
    points,
    userId: decoded.id,
    rate,
    place,
  });

  await safeNotify(
    user.fcmToken,
    lang === "ar" ? "طلب استرداد" : "Redemption Request",
    lang === "ar"
      ? "تم تقديم طلب الاسترداد"
      : "Your redemption request submitted",
    {
      type: "redemption_requested",
      walaaId: walaaHistory._id.toString(),
      currentPoints: user.currentpoints.toString(),
    }
  );

  res.status(200).json({ status: 200, data: walaaHistory });
});

/* ================== UPDATE ================== */


exports.updateWalaaHistory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {  status, rate, collect, place } = req.body;

  // 1️⃣ جلب الحالة القديمة
  const oldWalaa = await walaaHistoryModel.findById(id);
  if (!oldWalaa) return next(new ApiErrors(`No Walaa history found for this ID: ${id}`, 404));

  // 2️⃣ تحديث الحقول المسموح بها فقط
  const updates = { status, rate, collect, place };
  const walaaAfterUpdated = await walaaHistoryModel.findByIdAndUpdate(
    id,
    updates,
    { new: true }
  ).populate("userId");

  if (!walaaAfterUpdated) return next(new ApiErrors("Failed to update Walaa history", 500));

  // 3️⃣ جلب بيانات المستخدم
  const UserData = await UserModel.findById(walaaAfterUpdated.userId._id);

    const lang= UserData.lang;

  if (!UserData) return next(new ApiErrors("User not found", 404));

  const points = walaaAfterUpdated.points;
  let incData = {};
  let notificationTitle = "";
  let notificationBody = "";
  let notificationData = null;

  // 4️⃣ زيادة النقاط عند إتمام النشاط
  if (
    oldWalaa.status !== "compelete" &&
    walaaAfterUpdated.status === "compelete"
  ) {
    incData.pointsRLevel = points;

    notificationTitle = lang === 'ar' ? "تم إتمام النشاط!" : "Activity Completed!";
    notificationBody = lang === 'ar'
      ? `تم إتمام طلبك. تم إضافة ${points} نقطة إلى مستوى حسابك.`
      : `Your request is completed. ${points} points have been added to your account.`;
    notificationData = {
      type: 'activity_completed',
      walaaId: walaaAfterUpdated._id.toString(),
      points: points.toString(),
      levelPoints: (UserData.pointsRLevel + points).toString()
    };
  }

  // 5️⃣ جمع النقاط إذا collect=true وplace="h"
  if (
    oldWalaa.collect !== true &&
    walaaAfterUpdated.collect === true &&
    walaaAfterUpdated.place === "h" &&
    points > 0
  ) {
    incData.pointsRLevel = (incData.pointsRLevel || 0) + points;
    incData.currentpoints = points;

    notificationTitle = notificationTitle || (lang === 'ar' ? "تم جمع النقاط!" : "Points Collected!");
    notificationBody = notificationBody || (lang === 'ar'
      ? `لقد جمعت ${points} نقطة!`
      : `You have collected ${points} points!`);
    notificationData = notificationData || {
      type: 'points_collected',
      walaaId: walaaAfterUpdated._id.toString(),
      points: points.toString(),
      currentPoints: (UserData.currentpoints + points).toString()
    };
  }

  // 6️⃣ تطبيق النقاط مرة واحدة
  if (Object.keys(incData).length > 0) {
    await UserModel.findByIdAndUpdate(
      UserData._id,
      { $inc: incData },
      { new: true }
    );
  }

  // 7️⃣ إرسال الإشعار
  if (notificationData) {
    try {
      await sendNotification(UserData.fcmToken,
         notificationTitle, 
      lang === 'ar' ? (UserData.name + ", " + notificationBody) : (UserData.slug + ", " + notificationBody),
          notificationData, lang);
    } catch (err) {
      console.warn("Notification error:", err.message);
    }
  }

  res.status(200).json({ status: 200, message: "Updated Walaa history!" });
});


/* ================== GETTERS ================== */
exports.getAllWalaaHistory = asyncHandler(async (req, res) => {

  const WalaaData = await walaaHistoryModel
    .find({})
    .populate("userId", "name")
    .sort({ collect: 1, createdAt: -1 });

  const populatedData = await Promise.all(
    WalaaData.map(async (history) => {
      if (mongoose.isValidObjectId(history.title)) {
        history = await history.populate({
          path: "title",
          model: "Rewards",
          select: "title points",
        });
      }
      return history;
    })
  );

  res.status(200).json({
    status: 200,
    data: populatedData,
    number: populatedData.length
  });

});

exports.userWalaaHistory = asyncHandler(async (req, res, next) => {

  if (!req.headers.authorization) {
    return next(new ApiErrors("Headers does not have token!", 401));
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return next(new ApiErrors("Token missing in authorization header", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    console.log(err)
    return next(new ApiErrors("Invalid or expired token!", 401));
  }

  const WalaaData = await walaaHistoryModel.find({
    userId: decoded.id
  }).populate("userId", "name")
    .sort({ collect: 1, createdAt: -1 });

  const populatedData = await Promise.all(
    WalaaData.map(async (history) => {
      if (mongoose.isValidObjectId(history.title)) {
        history = await history.populate({
          path: "title",
          model: "Rewards",
          select: "title points",
        });
      }
      return history;
    })
  ); res.status(200).json({
    status: 200,
    data: populatedData,
    number: populatedData.length
  })


})

/* ================== DELETE ================== */
exports.deleteWalaaHistory = asyncHandler(async (req, res, next) => {
  const deleted = await walaaHistoryModel.findByIdAndDelete(req.params.id);
  if (!deleted) return next(new ApiErrors("Not found", 404));

  res.status(200).json({ status: 200, message: "Deleted successfully" });
});
exports.getAllWalaaGivenPoint = asyncHandler(async (req, res, next) => {
  const walaaData = await walaaHistoryModel
    .find({ place: "h" })
    .populate("userId", "name")
    .sort({ collect: 1, createdAt: -1 });

  const populatedData = await Promise.all(
    walaaData.map(async (history) => {
      if (mongoose.Types.ObjectId.isValid(history.title)) {
        await history.populate({
          path: "title",
          model: "Rewards",
          select: "title points",
        });
      }
      return history;
    })
  );

  res.status(200).json({
    status: 200,
    results: populatedData.length,
    data: populatedData,
  });
});

exports.getAllWalaaHistoryPending = asyncHandler(async (req, res, next) => {
  const walaaData = await walaaHistoryModel
    .find({ status: "pending" })
    .populate("userId", "name lang")
    .sort({ collect: 1, createdAt: -1 });

  const populatedData = await Promise.all(
    walaaData.map(async (history) => {
      if (mongoose.Types.ObjectId.isValid(history.title)) {
        await history.populate({
          path: "title",
          model: "Rewards",
          select: "title points",
        });
      }
      return history;
    })
  );

  res.status(200).json({
    status: 200,
    results: populatedData.length,
    data: populatedData,
  });
});

exports.cancelRedeem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { language } = req.body;

  const lang = language || 'en';

  let notificationTitle, notificationBody;

  if (lang === 'ar') {
    notificationTitle = "تم إلغاء الاستبدال";
    notificationBody = `تم إلغاء عملية الاستبدال الخاصة بك وتم استرجاع النقاط`;
  } else {
    notificationTitle = "Redemption Cancelled";
    notificationBody = `Your redemption has been cancelled and points have been restored`;
  }

  const walaaRecord = await walaaHistoryModel.findById(id).populate("userId");
  if (!walaaRecord) {
    return next(new ApiErrors(`No walaa record found for this ID: ${id}`, 404));
  }

  if (walaaRecord.status === "cancel") {
    return res.status(200).json({
      status: 200,
      message: "This redeem is already in 'cancel' status. No action taken.",
    });
  }

  if (walaaRecord.canceled) {
    return next(new ApiErrors(`This redeem has already been canceled`, 400));
  }

  const UserData = await UserModel.findById(walaaRecord.userId._id);
  if (!UserData) {
    return next(new ApiErrors(`No User found for this ID: ${walaaRecord.userId}`, 404));
  }

  UserData.currentpoints += walaaRecord.points;
  await UserData.save();

  walaaRecord.canceled = true;
  walaaRecord.status = "cancel";
  await walaaRecord.save();

  // Send cancellation notification
  if (UserData.fcmToken) {
    await sendNotification(
      UserData.fcmToken,
      notificationTitle,
      lang === 'ar' ? (UserData.name + ", " + notificationBody) : (UserData.slug + ", " + notificationBody),
      {
        type: 'redemption_cancelled',
        walaaId: walaaRecord._id.toString(),
        points: walaaRecord.points.toString(),
        currentPoints: UserData.currentpoints.toString()
      }
    );
  }

  res.status(200).json({
    status: 200,
    message: "Redeem canceled and points restored successfully",
    data: UserData
  });
});

exports.acceptRedeem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
    const walaaRecord = await walaaHistoryModel.findById(id).populate("userId");

  const UserData = await UserModel.findById(walaaRecord.userId._id);

  let lang ;
  lang= UserData.lang;
  let notificationTitle, notificationBody;

  if (lang === 'ar') {
    notificationTitle = `تم قبول الاستبدال`;
    notificationBody = `تم قبول عملية الاستبدال الخاصة بك`;
  } else {
    notificationTitle = "Redemption Completed";
    notificationBody = `Your redemption has been completed`;
  }

  if (!walaaRecord) {
    return next(new ApiErrors(`No walaa record found for this ID: ${id}`, 404));
  }

  if (walaaRecord.status === "compelete") {
    return res.status(200).json({
      status: 200,
      message: "This redeem is already in 'compelete' status. No action taken.",
    });
  }

  if (walaaRecord.compelete) {
    return next(new ApiErrors(`This redeem has already been completed`, 400));
  }

  if (!UserData) {
    return next(new ApiErrors(`No User found for this ID: ${walaaRecord.userId}`, 404));
  }

  // Update user points after redemption
  await UserData.save();

  walaaRecord.compelete = true;
  walaaRecord.status = "compelete";
  await walaaRecord.save();

  // Send completion notification
  if (UserData.fcmToken) {
    await sendNotification(
      UserData.fcmToken,
      notificationTitle,
      UserData.lang === 'ar' ? (UserData.name + ", " + notificationBody) : (UserData.slug + ", " + notificationBody),
      {
        type: 'redemption_compeleted',
        walaaId: walaaRecord._id.toString(),
        points: walaaRecord.points.toString(),
        currentPoints: UserData.currentpoints.toString()
      }
    );
  }

  res.status(200).json({
    status: 200,
    message: "Redeem completed successfully",
    data: UserData
  });
});




exports.getUserHistory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: 400,
      message: "User ID is required",
    });
  }

  const WalaaData = await walaaHistoryModel
    .find({ userId: id })
    .populate("userId", "name")
    .sort({ collect: 1, createdAt: -1 });

  const populatedData = await Promise.all(
    WalaaData.map(async (history) => {
      if (mongoose.isValidObjectId(history.title)) {
        history = await history.populate({
          path: "title",
          model: "Rewards",
          select: "title points",
        });
      }
      return history;
    })
  );

  res.status(200).json({
    status: 200,
    results: populatedData.length,
    data: populatedData,
  });
});



exports.deleteWalaaHistoryPoints = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const walaaRecord = await walaaHistoryModel
    .findById(id)
    .populate("userId");

  if (!walaaRecord) {
    return next(new ApiErrors(`No Walaa history found for this ID: ${id}`, 404));
  }

  const UserData = await UserModel.findById(walaaRecord.userId._id);
  if (!UserData) {
    return next(new ApiErrors(`No User found for this ID`, 404));
  }

  if (
    walaaRecord.collect === true &&
    walaaRecord.place === "h" &&
    walaaRecord.points !== 0
  ) {
    const points = walaaRecord.points;

    if (points > 0) {
      UserData.currentpoints = Math.max(
        0,
        UserData.currentpoints - points
      );

      UserData.pointsRLevel = Math.max(
        0,
        UserData.pointsRLevel - points
      );
    }
    else {
      const absPoints = Math.abs(points);

      UserData.currentpoints += absPoints;
    }

    await UserData.save();
  }

  await walaaHistoryModel.findByIdAndDelete(id);

  res.status(200).json({
    status: 200,
    message: "Deleted successfully and points reversed correctly",
  });
});



exports.getWalaaPointsSummary = asyncHandler(async (req, res) => {
  const now = new Date();

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const place = "h";

  const [
    today,
    currentMonth,
    lastMonth,
    unCollected
  ] = await Promise.all([
    walaaHistoryModel.aggregate([
      {
        $match: {
          place,
          createdAt: { $gte: startOfDay, $lt: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: "$points" }
        }
      }
    ]),

    walaaHistoryModel.aggregate([
      {
        $match: {
          place,
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: "$points" }
        }
      }
    ]),

    walaaHistoryModel.aggregate([
      {
        $match: {
          place,
          createdAt: {
            $gte: startOfLastMonth,
            $lt: endOfLastMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: "$points" }
        }
      }
    ]),

    walaaHistoryModel.aggregate([
      {
        $match: {
          place,
          collect: false
        }
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: "$points" }
        }
      }
    ])
  ]);

  res.status(200).json({
    status: 200,
    data: {
      today: today[0]?.totalPoints || 0,
      currentMonth: currentMonth[0]?.totalPoints || 0,
      lastMonth: lastMonth[0]?.totalPoints || 0,
      unCollectedPoints: unCollected[0]?.totalPoints || 0
    }
  });
});



exports.getUserHistoryucollected = asyncHandler(async (req, res, next) => {

  const data = await walaaHistoryModel.aggregate([

    {
      $match: {
        collect: false,
        place: "h",
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
      },
    },
    { $unwind: "$userId" },

    {
      $lookup: {
        from: "rewards",
        localField: "title",
        foreignField: "_id",
        as: "title",
      },
    },
    {
      $unwind: {
        path: "$title",
        preserveNullAndEmptyArrays: true,
      },
    },

  ]);

  res.status(200).json({
    status: 200,
    results: data.length,
    data,
  });
});



exports.approveWalaaHistory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const walaaHistory = await walaaHistoryModel.findById(id);
  if (!walaaHistory) {
    return next(new ApiErrors("Walaa history not found", 404));
  }

  // 🔒 منع الاعتماد مرتين
  if (walaaHistory.approved === true) {
    return next(new ApiErrors("Operation already approved", 400));
  }

  const user = await UserModel.findById(walaaHistory.userId);
  if (!user) {
    return next(new ApiErrors("User not found", 404));
  }

  const points = walaaHistory.points;
  const isDeduction = points < 0;
  const lang = user.lang;

  /** =========================
   * تنفيذ العملية
   ========================= */
  if (isDeduction) {
    user.currentpoints = Math.max(0, user.currentpoints + points);
  } else {
    user.currentpoints += points;
  }

  await user.save();

  /** =========================
   * تحديث الحالة
   ========================= */
  walaaHistory.approved = true;
  await walaaHistory.save();

  /** =========================
   * تجهيز الإشعار
   ========================= */
  const notificationTitle = isDeduction
    ? (lang === 'ar' ? "تم خصم النقاط" : "Points Deducted")
    : (lang === 'ar' ? "تم إضافة النقاط" : "Points Added");

  const notificationBody = isDeduction
    ? (lang === 'ar'
        ? `${Math.abs(points)} نقطة تم خصمها من حسابك`
        : `${Math.abs(points)} points have been deducted from your account`)
    : (lang === 'ar'
        ? `لقد تم إضافة ${points} نقطة إلى حسابك!`
        : `You have received ${points} points!`);

  if (user.fcmToken) {
    try {
      await sendNotification(
        user.fcmToken,
        notificationTitle,
        lang === 'ar'
          ? `${user.name}, ${notificationBody}`
          : `${user.slug}, ${notificationBody}`,
        {
          type: isDeduction ? 'points_deducted' : 'points_added',
          walaaId: walaaHistory._id.toString(),
          points: points.toString(),
          currentPoints: user.currentpoints.toString()
        },
        lang
      );
    } catch (err) {
      console.warn("Notification failed:", err.message);
    }
  }

  return res.status(200).json({
    status: 200,
    message: "Operation approved successfully",
    currentPoints: user.currentpoints,
    data: walaaHistory
  });
});
