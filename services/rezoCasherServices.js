const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const { RezoCasherModel } = require("../models/rezoCasherModel");
const { BranchModel } = require("../models/branchModel");
const { productRezoModel } = require("../models/productcasherRezoModel");
const { uploadImage } = require("../utils/imageUploadedtoCloudinary");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");

//===========================
// CREATE New RezoCasher
// POST /api/rezo
//===========================

exports.createRezo = asyncHandler(async (req, res, next) => {
    let { item, branch, deliveryApp } = req.body;

    // 🔥 إذا وصل item من الـ Multipart كنص
    if (typeof item === "string") {
        try {
            item = JSON.parse(item);
            req.body.item = item;
        } catch (err) {
            return next(new ApiErrors("Invalid JSON format in item!", 400));
        }
    }

    // التحقق من وجود item
    if (!item || !Array.isArray(item) || item.length === 0) {
        return next(new ApiErrors("item array is required!", 400));
    }

    // رفع الصور
    const image = await uploadImage(req, "casherrezo", next);

    // التحقق من التوكن
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

    // التحقق من الفرع
    if (!branch) {
        return next(new ApiErrors("Branch ID is required!", 400));
    }

    const branchExist = await BranchModel.findById(branch);
    if (!branchExist) {
        return next(new ApiErrors("Invalid branch ID!", 400));
    }

    // التحقق من كل منتج داخل item array
    for (let i of item) {
        const productExist = await productRezoModel.findById(i.product);
        if (!productExist) {
            return next(
                new ApiErrors(`Invalid product ID: ${i.product}`, 400)
            );
        }
        if (!i.qty || i.qty < 1) {
            return next(new ApiErrors(`Qty must be >= 1`, 400));
        }
    }

    // إنشاء الريزو
    const rezo = await RezoCasherModel.create({
        item,
        image,
        branch,
        userID: decoded.id,
        deliveryApp
    });

    res.status(200).json({
        status: 200,
        message: "Rezo created successfully!",
        data: rezo,
    });
});
//===========================
// GET All RezoCasher
// GET /api/rezo
//===========================
exports.getAllRezo = asyncHandler(async (req, res) => {
    const rezos = await RezoCasherModel.find()
        .populate("branch", "name")
        .populate("userID", "name email")
        .populate("deliveryApp", "name")
        .populate("item.product");

    const rezosWithSaudiTime = rezos.map(r => ({
        ...r._doc,
        createdAt: moment(r.createdAt).tz("Asia/Riyadh").format(),
        updatedAt: moment(r.updatedAt).tz("Asia/Riyadh").format(),
    }));

    res.status(200).json({
        status: 200,
        count: rezos.length,
        data: rezosWithSaudiTime,
    });
});

//===========================
// GET Single Rezo by ID
// GET /api/rezo/:id
//===========================
exports.getRezoById = asyncHandler(async (req, res, next) => {
    const rezo = await RezoCasherModel.findById(req.params.id)
        .populate("branch", "name")
        .populate("userID", "name email")
        .populate({
            path: "item.product",
            select: "name price",
        });

    if (!rezo)
        return next(
            new ApiErrors(`No Rezo found with ID: ${req.params.id}`, 404)
        );

    res.status(200).json({
        status: 200,
        data: rezo,
    });
});

//===========================
// UPDATE Rezo
// PUT /api/rezo/:id
//===========================
exports.updateRezo = asyncHandler(async (req, res, next) => {
    const { item } = req.body;

    const updatedRezo = await RezoCasherModel.findByIdAndUpdate(
        req.params.id,
        { item },
        { new: true }
    );

    if (!updatedRezo)
        return next(
            new ApiErrors(`No Rezo found with ID: ${req.params.id}`, 404)
        );

    res.status(200).json({
        status: 200,
        message: "Rezo updated successfully!",
        data: updatedRezo,
    });
});

//===========================
// DELETE Rezo
// DELETE /api/rezo/:id
//===========================
exports.deleteRezo = asyncHandler(async (req, res, next) => {
    const deleted = await RezoCasherModel.findByIdAndDelete(req.params.id);

    if (!deleted)
        return next(
            new ApiErrors(`No Rezo found with ID: ${req.params.id}`, 404)
        );

    res.status(200).json({
        status: 200,
        message: "Rezo deleted successfully!",
        data: deleted,
    });
});

exports.getSalesReport = asyncHandler(async (req, res, next) => {
    const moment = require("moment-timezone");

    // لضبط التوقيت على السعودية
    const now = moment().tz("Asia/Riyadh");

    // ====== اليوم ======
    const startToday = now.clone().startOf("day").toDate();
    const endToday   = now.clone().endOf("day").toDate();

    // ====== أمس ======
    const startYesterday = now.clone().subtract(1, "day").startOf("day").toDate();
    const endYesterday   = now.clone().subtract(1, "day").endOf("day").toDate();

    // ====== الشهر الحالي ======
    const startThisMonth = now.clone().startOf("month").toDate();
    const endThisMonth   = now.clone().endOf("month").toDate();

    // ====== الشهر السابق ======
    const startLastMonth = now.clone().subtract(1, "month").startOf("month").toDate();
    const endLastMonth   = now.clone().subtract(1, "month").endOf("month").toDate();

    // Helper function → returns { totalSales, totalProfit }
    const calculateSales = async (start, end) => {
        const rezos = await RezoCasherModel.find({
            createdAt: { $gte: start, $lte: end }
        }).populate("item.product");

        let totalSales = 0;
        let totalProfit = 0;

        rezos.forEach(rezo => {
            rezo.item.forEach(i => {
                const product = i.product;

                if (!product) return;

                const price = product.price || 0;
                const cost = product.cost || 0;

                totalSales += price * i.qty;
                totalProfit += (price - cost) * i.qty;
            });
        });

        return { totalSales, totalProfit };
    };

    // حساب كل الفترات
    const today = await calculateSales(startToday, endToday);
    const yesterday = await calculateSales(startYesterday, endYesterday);
    const thisMonth = await calculateSales(startThisMonth, endThisMonth);
    const lastMonth = await calculateSales(startLastMonth, endLastMonth);

    res.status(200).json({
        status: 200,
        today,
        yesterday,
        thisMonth,
        lastMonth
    });
});
