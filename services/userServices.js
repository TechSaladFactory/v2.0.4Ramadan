const { default: slugify } = require("slugify");
const { UserModel } = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");
const { uploadImage } = require("../utils/imageUploadedtoCloudinary");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
async function sendOTPConfirmEmail(toEmail, code) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `${process.env.App_Name}`,
    to: toEmail,
    subject: "Your Confirm E-mail Code",
    text: `Your Confirm E-mail code is: ${code}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TroveeBuy - Email Verification</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f7fa;
          color: #333333;
          margin: 0;
          padding: 0;
          line-height: 1.6;
        }
        .container {
          max-width: 580px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          padding: 25px 0;
          text-align: center;
          border-bottom: 1px solid #eaeaea;
          background-color: #ffffff;
        }
        .brand-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        .logo {
          height: 40px;
          width: auto;
        }
        .brand-name {
          font-size: 24px;
          font-weight: 700;
          color: #2a52be;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 32px 40px;
        }
        .greeting {
          font-size: 18px;
          color: #2c3e50;
          margin-bottom: 24px;
        }
        .code-container {
          margin: 32px 0;
          text-align: center;
        }
        .verification-code {
          display: inline-block;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #2a52be;
          padding: 16px 24px;
          background-color: #f8f9ff;
          border-radius: 6px;
          border: 1px solid #e0e5ff;
        }
        .instructions {
          font-size: 15px;
          color: #555555;
          margin-bottom: 24px;
          line-height: 1.7;
        }
        .expiry-notice {
          background-color: #fff9f2;
          border-left: 4px solid #ffb347;
          padding: 16px;
          margin: 28px 0;
          font-size: 14px;
          border-radius: 0 4px 4px 0;
        }
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #999999;
          border-top: 1px solid #eeeeee;
          background-color: #fafafa;
        }
        .support-info {
          margin-top: 20px;
          font-size: 14px;
          color: #666666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand-container">
            <div class="brand-name">${process.env.App_Name}</div>
          </div>
        </div>

        <div class="content">
          <div class="greeting">Dear Valued Customer,</div>

          <p class="instructions">
            Thank you for joining ${process.env.App_Name}. To complete your account verification, 
            please use the following security code:
          </p>

          <div class="code-container">
            <div class="verification-code">${code}</div>
          </div>

          <div class="expiry-notice">
            <strong>This verification code will expire in 10 minutes.</strong>
            For your security, please do not share this code with anyone.
          </div>

          <p class="instructions">
            If you didn't request this code, please ignore this email or contact our 
            support team immediately at <a href="mailto:support@${process.env.App_Name}.com" style="color: #2a52be;">support@${process.env.App_Name}.com</a>.
          </p>

          <div class="support-info">
            Need assistance? Our customer service team is available 24/7 at +1 (800) 555-0199
          </div>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} ${process.env.App_Name} Inc. All rights reserved.<br>
          456 Marketplace Drive, Seattle, WA 98101<br><br>
          <span style="color: #bbbbbb;">This is an automated message. Please do not reply.</span>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

//Get All user
//roure >> Get Method
// /api/user/getAll

exports.getUser = asyncHandler(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;
  const keyword = req.query.keyword ? req.query.keyword.trim() : null;

  // فلتر البحث
  let filter = {};

  if (keyword) {
    filter.name = { $regex: keyword, $options: "i" }; 
    // i = case insensitive
  }

  const total = await UserModel.countDocuments(filter);

  let query = UserModel.find(filter).populate({
    path: "department",
    select: "name",
  });

  // Pagination
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const users = await query.lean();

  res.status(200).json({
    data: users,
    currentPage: page || 1,
    totalPages: limit ? Math.ceil(total / limit) : 1,
    totalItems: total,
    itemsPerPage: limit || total,
    status: 200,
  });
});

//Get Special user By id
//roure >> Get Method
// /api/user/id
exports.getSpecialallUserByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const UserByid = await UserModel.findById({ _id: id }).populate({
    path: "department",
    select: "name",
  });

  if (!UserByid) {
    return next(new ApiErrors(`No user found for this UserID: ${id} !`, 404));
  }

  res.status(200).json({ data: UserByid, status: 200 });
});
//create new user
//roure >> Post Method
// /api/user/adduser

exports.addnewUser = asyncHandler(async (req, res, next) => {
  if (req.body.department && typeof req.body.department === "string") {
    req.body.department = req.body.department.split(",").map((id) => id.trim());
  }

  if (!req.body.name) {
    return next(new ApiErrors("Name is required!", 400));
  }

  if (req.body.name.trim() === "") {
    return next(new ApiErrors("Name must not be empty!", 400));
  }

  // بناء جسم المستخدم لإنشاءه في قاعدة البيانات
  const newUserData = {
    name: req.body.name,
    slug: slugify(req.body.name),
    password: req.body.password,
    phone: req.body.phone,
    email: "no email",
    department: req.body.department,
    role: req.body.role,
  };

  const Userresponse = await UserModel.create(newUserData);

  res.status(200).json({
    data: Userresponse,
    message:
      "Signup successfully, please check your inbox to confirm your account!",
    status: 200,
  });
});

//Update to Special user
//roure >> Update Method
// /api/user/id
exports.updateUserByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, password, role, phone } = req.body;

  if (!req.file || req.file === undefined || req.file === "") {
    const userAfterUpdated = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        slug: slugify(name),
        password: password,
        phone,
        role,
      },
      { new: true },
    );
    console.log(11);
    if (userAfterUpdated) {
      res.status(200).json({
        message: "User is updated successfully !",
        status: 200,
        data: userAfterUpdated,
      });
    }
    if (!userAfterUpdated) {
      return next(new ApiErrors(`No User found for this UserID: ${id} !`, 404));
    }
  } else {
    const profileImg = await uploadImage(req, "Users", next);
    console.log(name);
    const userAfterUpdated = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        profileImg,
        slug: slugify(name),
        password: await bcrypt.hash(password, 12),
        phone,
        role,
        passwordChangedAt: Date.now(),
      },
      { new: true },
    );

    if (name === undefined) {
      return next(new ApiErrors("User name required !", 404));
    } else if (name === "") {
      return next(new ApiErrors(`User name is empty !`, 404));
    } else {
      if (!userAfterUpdated) {
        return next(
          new ApiErrors(`No user found for this UserID: ${id} !`, 404),
        );
      }

      if (userAfterUpdated) {
        res.status(200).json({
          message: "User is updated successfully !",
          status: 200,
          data: userAfterUpdated,
        });
      }
      if (!userAfterUpdated) {
        return next(
          new ApiErrors(`No user found for this UserID: ${id} !`, 404),
        );
      }
    }
  }
});
exports.updateUserdeparetmentByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { department } = req.body;
  if (!department || department === undefined || department === "") {
    return next(new ApiErrors(`Deparetment is required !`, 404));
  }
  const userAfterUpdated = await UserModel.findOneAndUpdate(
    { _id: id },
    {
      department,
    },
    { new: true },
  );
  console.log(11);
  if (userAfterUpdated) {
    res.status(200).json({
      message: "User department is updated successfully !",
      status: 200,
      data: userAfterUpdated,
    });
  }
  if (!userAfterUpdated) {
    return next(new ApiErrors(`No User found for this UserID: ${id} !`, 404));
  }
});

//Delete user
//roure >> Delete Method
// /api/user/id

exports.deleteUserByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedUser = await UserModel.findOneAndDelete({ _id: id });

  if (id === undefined) {
    return next(new ApiErrors("Set user ID !", 404));
  } else {
    if (!deletedUser) {
      return next(new ApiErrors(`No user found for this UserID: ${id} !`, 404));
    }

    res.status(200).json({
      message: "user is deleted successfully !",
      status: 200,
      data: deletedUser,
    });
  }
});

//Update to Special user
//roure >> Update Method
// /api/user/id
exports.updateUserPasswordByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { currentPassward, newpassword } = req.body;
  const UserByid = await UserModel.findById({ _id: id });

  if (!UserByid) {
    return next(new ApiErrors(`No user found for this UserID: ${id} !`, 404));
  }
  console.log(UserByid.password);
  const currentPasswardEncrypted = UserByid.password;
  const isMatch = await bcrypt.compare(
    currentPassward,
    currentPasswardEncrypted,
  );

  if (isMatch === true) {
    const userAfterUpdated = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        password: await bcrypt.hash(newpassword, 12),
        passwordChangedAt: Date.now(),
      },
      { new: true },
    );
    console.log(11);
    if (userAfterUpdated) {
      res.status(200).json({
        message: "The Password is changed successfully !",
        status: 200,
        data: userAfterUpdated,
      });
    }
    if (!userAfterUpdated) {
      return next(new ApiErrors(`No User found for this UserID: ${id} !`, 404));
    }
  } else {
    return next(new ApiErrors(`Current Password is not Correct !`, 404));
  }
});

//permissionusertoadd
exports.permissionusertoadd = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { canAddProduct } = req.body;

  const userAfterUpdated = await UserModel.findByIdAndUpdate(
    { _id: id },
    {
      canAddProduct: canAddProduct,
    },
    { new: true },
  );

  if (!userAfterUpdated) {
    return next(new ApiErrors(`No user found for this UserID: ${id} !`, 404));
  }
  const value = canAddProduct == true ? "Allowed to add" : "Not allowed to add";
  res.status(200).json({ message: value, status: 200 });
});

//permissionusertoremove
exports.permissionusertoremove = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { canRemoveProduct } = req.body;

  const userAfterUpdated = await UserModel.findByIdAndUpdate(
    { _id: id },
    {
      canRemoveProduct: canRemoveProduct,
    },
    { new: true },
  );

  if (!userAfterUpdated) {
    return next(new ApiErrors(`No user found for this UserID: ${id} !`, 404));
  }
  const value =
    canRemoveProduct == true ? "Allowed to remove" : "Not allowed to remove";
  res.status(200).json({ message: value, status: 200 });
});

exports.activeAccount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isVerified } = req.body;
  const userdata = await UserModel.findOneAndUpdate(
    { _id: id },
    { isVerified: isVerified },
    { new: true },
  );

  if (!userdata) {
    return next(new ApiErrors(`No user found for this UserID: ${id} !`, 404));
  }
  if (isVerified === undefined || isVerified === "") {
    return next(new ApiErrors(`isVerified required`, 404));
  }
  const value =
    isVerified == true
      ? "The account is  activated successfully"
      : "The account is not activated.";

  res.status(200).json({ message: value, status: 200 });
});

exports.canAddProductIN = asyncHandler(async (req, res, next) => {
  const { canaddProductIN } = req.body;
  const id = req.params.id;

  if (canaddProductIN === undefined || canaddProductIN === "") {
    return next(new ApiErrors(`canaddProductIN is required`, 400));
  }

  const userData = await UserModel.findOneAndUpdate(
    { _id: id },
    { canaddProductIN },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`No user found for this UserID: ${id}!`, 404));
  }

  const value =
  canaddProductIN === true
      ? "The account Per can add"
      : "The account Per can't add";

  res.status(200).json({ message: value, status: 200 });
});



// ✅ السماح أو منع المستخدم من "إنتاج منتج"
exports.canProduction = asyncHandler(async (req, res, next) => {
  const { canProduction } = req.body;
  const id = req.params.id;

  if (canProduction === undefined || canProduction === "") {
    return next(new ApiErrors(`canProduction is required`, 400));
  }

  const userData = await UserModel.findOneAndUpdate(
    { _id: id },
    { canProduction },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`No user found for this UserID: ${id}!`, 404));
  }

  const value =
    canProduction === true
      ? "The account can produce products"
      : "The account can't produce products";

  res.status(200).json({ message: value, status: 200 });
});


// ✅ السماح أو منع المستخدم من "طلب إنتاج"
exports.canOrderProduction = asyncHandler(async (req, res, next) => {
  const { canOrderProduction } = req.body;
  const id = req.params.id;

  if (canOrderProduction === undefined || canOrderProduction === "") {
    return next(new ApiErrors(`canOrderProduction is required`, 400));
  }

  const userData = await UserModel.findOneAndUpdate(
    { _id: id },
    { canOrderProduction },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`No user found for this UserID: ${id}!`, 404));
  }

  const value =
    canOrderProduction === true
      ? "The account can request production"
      : "The account can't request production";

  res.status(200).json({ message: value, status: 200 });
});


// ✅ السماح أو منع المستخدم من "الاستلام"
exports.canReceiveProduct = asyncHandler(async (req, res, next) => {
  const { canReceive } = req.body;
  const id = req.params.id;

  if (canReceive === undefined || canReceive === "") {
    return next(new ApiErrors(`canReceive is required`, 400));
  }

  const userData = await UserModel.findOneAndUpdate(
    { _id: id },
    { canReceive },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`No user found for this UserID: ${id}!`, 404));
  }

  const value =
    canReceive === true
      ? "The account can receive products"
      : "The account can't receive products";

  res.status(200).json({ message: value, status: 200 });
});

// Per  Send
exports.canSendProduct = asyncHandler(async (req, res, next) => {
  const { canSend } = req.body;
  const id = req.params.id;

  if (canSend === undefined || canSend === "") {
    return next(new ApiErrors(`canSend is required`, 400));
  }

  const userData = await UserModel.findOneAndUpdate(
    { _id: id },
    { canSend },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`No user found for this UserID: ${id}!`, 404));
  }

  const value =
  canSend === true
      ? "The account can send products"
      : "The account can't send products";

  res.status(200).json({ message: value, status: 200 });
});



//Per Supply
exports.canSupplyProduct = asyncHandler(async (req, res, next) => {
  const { canSupply } = req.body;
  const id = req.params.id;

  if (canSupply === undefined || canSupply === "") {
    return next(new ApiErrors(`canSupply is required`, 400));
  }

  const userData = await UserModel.findOneAndUpdate(
    { _id: id },
    { canSupply },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`No user found for this UserID: ${id}!`, 404));
  }

  const value =
  canSupply === true
      ? "The account can supply products"
      : "The account can't supply products";

  res.status(200).json({ message: value, status: 200 });
});


//Per Damaged
exports.canDamagedProduct = asyncHandler(async (req, res, next) => {
  const { canDamaged } = req.body;
  const id = req.params.id;

  if (canDamaged === undefined || canDamaged === "") {
    return next(new ApiErrors(`canDamaged is required`, 400));
  }

  const userData = await UserModel.findOneAndUpdate(
    { _id: id },
    { canDamaged },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`No user found for this UserID: ${id}!`, 404));
  }

  const value =
  canDamaged === true
      ? "The account can Damaged products"
      : "The account can't Damaged products";

  res.status(200).json({ message: value, status: 200 });
});

//Per Branch OP


// ✅ إضافة فرع لمستخدم
exports.addBranchToUserOP = asyncHandler(async (req, res, next) => {
  const { userId, branchId } = req.body;

  // التحقق من الإدخال
  if (!userId || !branchId) {
    return next(new ApiErrors(`userId and branchId are required!`, 400));
  }

  // تحديث المستخدم بإضافة الفرع
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $addToSet: { branchesTo_OP: branchId } }, // يضيف الفرع لو مش موجود
    { new: true }
  ).populate("branchesTo_OP");

  if (!user) {
    return next(new ApiErrors(`User not found!`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "Branch added successfully",
    data: user,
  });
});

exports.removeBranchFromUserOP = asyncHandler(async (req, res, next) => {
  const { userId, branchId } = req.body;

  if (!userId || !branchId) {
    return next(new ApiErrors(`userId and branchId are required!`, 400));
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $pull: { branchesTo_OP: branchId } }, // يحذف الفرع
    { new: true }
  ).populate("branchesTo_OP");

  if (!user) {
    return next(new ApiErrors(`User not found!`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "Branch removed successfully",
    data: user,
  });
});


//Per Branch OS


// ✅ إضافة فرع لمستخدم
exports.addBranchToUserOS = asyncHandler(async (req, res, next) => {
  const { userId, branchId } = req.body;

  // التحقق من الإدخال
  if (!userId || !branchId) {
    return next(new ApiErrors(`userId and branchId are required!`, 400));
  }

  // تحديث المستخدم بإضافة الفرع
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $addToSet: { branchesTo_OS: branchId } }, // يضيف الفرع لو مش موجود
    { new: true }
  ).populate("branchesTo_OS");

  if (!user) {
    return next(new ApiErrors(`User not found!`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "Branch added successfully",
    data: user,
  });
});

exports.removeBranchFromUserOS = asyncHandler(async (req, res, next) => {
  const { userId, branchId } = req.body;

  if (!userId || !branchId) {
    return next(new ApiErrors(`userId and branchId are required!`, 400));
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $pull: { branchesTo_OS: branchId } }, // يحذف الفرع
    { new: true }
  ).populate("branchesTo_OS");

  if (!user) {
    return next(new ApiErrors(`User not found!`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "Branch removed successfully",
    data: user,
  });
});
//tawalf
exports.addBranchToUserTawalf = asyncHandler(async (req, res, next) => {
  const { userId, branchId } = req.body;

  // التحقق من الإدخال
  if (!userId || !branchId) {
    return next(new ApiErrors(`userId and branchId are required!`, 400));
  }

  // تحديث المستخدم بإضافة الفرع
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $addToSet: { branchesTo_Tawlf: branchId } }, // يضيف الفرع لو مش موجود
    { new: true }
  ).populate("branchesTo_Tawlf");

  if (!user) {
    return next(new ApiErrors(`User not found!`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "Branch added successfully",
    data: user,
  });
});

exports.removeBranchFromUserTawalf = asyncHandler(async (req, res, next) => {
  const { userId, branchId } = req.body;

  if (!userId || !branchId) {
    return next(new ApiErrors(`userId and branchId are required!`, 400));
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $pull: { branchesTo_Tawlf: branchId } }, // يحذف الفرع
    { new: true }
  ).populate("branchesTo_Tawlf");

  if (!user) {
    return next(new ApiErrors(`User not found!`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "Branch removed successfully",
    data: user,
  });
});


//Per canEditLastSupply
exports.canEditLastSupplyProduct = asyncHandler(async (req, res, next) => {
  const { canEditLastSupply } = req.body;
  const id = req.params.id;

  if (canEditLastSupply === undefined || canEditLastSupply === "") {
    return next(new ApiErrors(`canEditLastSupply is required`, 400));
  }

  const userData = await UserModel.findOneAndUpdate(
    { _id: id },
    { canEditLastSupply },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`No user found for this UserID: ${id}!`, 404));
  }

  const value =
  canEditLastSupply === true
      ? "The account can canEditLastSupply products"
      : "The account can't canEditLastSupply products";

  res.status(200).json({ message: value, status: 200 });
});


//Per canEditLastSupply
exports.canEditLastOrderProductionProduct = asyncHandler(async (req, res, next) => {
  const { canEditLastOrderProduction } = req.body;
  const id = req.params.id;

  if (canEditLastOrderProduction === undefined || canEditLastOrderProduction === "") {
    return next(new ApiErrors(`canEditLastOrderProduction is required`, 400));
  }

  const userData = await UserModel.findOneAndUpdate(
    { _id: id },
    { canEditLastOrderProduction },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`No user found for this UserID: ${id}!`, 404));
  }

  const value =
  canEditLastOrderProduction === true
      ? "The account can canEditLastOrderProduction products"
      : "The account can't canEditLastOrderProduction products";

  res.status(200).json({ message: value, status: 200 });
});

//can show tawalf 
exports.ShowTawalf=asyncHandler(async(req,res,next)=>{
const id=req.params.id;
const{canShowTawalf}=req.body

const userData= await UserModel.findByIdAndUpdate({_id:id},{canShowTawalf:canShowTawalf},{new:true});

if(!userData){
      return next(new ApiErrors(`no user with this id :${id}`, 400));

}
if(canShowTawalf===undefined||canShowTawalf===""){
      return next(new ApiErrors(`canShowTawalf is required`, 400));

}
let v= canShowTawalf===true?"Show tawalf Active":"Show tawalf is inActive";
res.status(200).json({
  message:v,
  status:200
})
})
//casher


exports.showRZOCasher=asyncHandler(async(req,res,next)=>{

const id = req.params.id;
  const { canshowRezoCahser } = req.body;

  const userData = await UserModel.findByIdAndUpdate(
    { _id: id },
    { canshowRezoCahser: canshowRezoCahser },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`no user with this id :${id}`, 400));
  }
  if (canshowRezoCahser === undefined || canshowRezoCahser === "") {
    return next(new ApiErrors(`canshowRezoCahser is required`, 400));
  }

  let v =
    canshowRezoCahser === true
      ? "Show Casher Active"
      : "Show Casher is inActive";

  res.status(200).json({
    message: v,
    status: 200,
})



})

exports.showaddRZOCasher=asyncHandler(async(req,res,next)=>{

const id = req.params.id;
  const { canaddRezoCahser } = req.body;

  const userData = await UserModel.findByIdAndUpdate(
    { _id: id },
    { canaddRezoCahser: canaddRezoCahser },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`no user with this id :${id}`, 400));
  }
  if (canaddRezoCahser === undefined || canaddRezoCahser === "") {
    return next(new ApiErrors(`canaddRezoCahser is required`, 400));
  }

  let v =
    canaddRezoCahser === true
      ? "Show Casher Active"
      : "Show Casher is inActive";

  res.status(200).json({
    message: v,
    status: 200,
})



})

//branch
exports.addBranchToUserRezoCasher = asyncHandler(async (req, res, next) => {
  const { userId, branchId } = req.body;

  if (!userId || !branchId) {
    return next(new ApiErrors(`userId and branchId are required!`, 400));
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $addToSet: { branchesTo_addRezoCasher: branchId } },
    { new: true }
  ).populate("branchesTo_addRezoCasher");

  if (!user) {
    return next(new ApiErrors(`User not found!`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "Branch added successfully",
    data: user,
  });
});

exports.removeBranchFromUserRezoCasher = asyncHandler(async (req, res, next) => {
  const { userId, branchId } = req.body;

  if (!userId || !branchId) {
    return next(new ApiErrors(`userId and branchId are required!`, 400));
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $pull: { branchesTo_addRezoCasher: branchId } }, // يحذف الفرع
    { new: true }
  ).populate("branchesTo_addRezoCasher");

  if (!user) {
    return next(new ApiErrors(`User not found!`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "Branch removed successfully",
    data: user,
  });
});


exports.showRZOPhotoCasher=asyncHandler(async(req,res,next)=>{

const id = req.params.id;
  const { canshowCahserRezoPhoto } = req.body;

  const userData = await UserModel.findByIdAndUpdate(
    { _id: id },
    { canshowCahserRezoPhoto: canshowCahserRezoPhoto },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`no user with this id :${id}`, 400));
  }
  if (canshowCahserRezoPhoto === undefined || canshowCahserRezoPhoto === "") {
    return next(new ApiErrors(`canshowCahserRezoPhoto is required`, 400));
  }

  let v =
    canshowCahserRezoPhoto === true
      ? "Show Casher Rezo photo Active"
      : "Show Casher Rezo photo is inActive";

  res.status(200).json({
    message: v,
    status: 200,
})



})


exports.showManageWalaa=asyncHandler(async(req,res,next)=>{

const id = req.params.id;
  const { canshowManageWalaa } = req.body;

  const userData = await UserModel.findByIdAndUpdate(
    { _id: id },
    { canshowManageWalaa: canshowManageWalaa },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`no user with this id :${id}`, 400));
  }
  if (canshowManageWalaa === undefined || canshowManageWalaa === "") {
    return next(new ApiErrors(`canshowManageWalaa is required`, 400));
  }

  let v =
    canshowManageWalaa === true
      ? "Show ManageWalaa Active"
      : "Show ManageWalaa is inActive";

  res.status(200).json({
    message: v,
    status: 200,
})



})





exports.showWalaa=asyncHandler(async(req,res,next)=>{

const id = req.params.id;
  const { canshowWalaa } = req.body;

  const userData = await UserModel.findByIdAndUpdate(
    { _id: id },
    { canshowWalaa: canshowWalaa },
    { new: true }
  );

  if (!userData) {
    return next(new ApiErrors(`no user with this id :${id}`, 400));
  }
  if (canshowWalaa === undefined || canshowWalaa === "") {
    return next(new ApiErrors(`canshowWalaa is required`, 400));
  }

  let v =
    canshowWalaa === true
      ? "Show Walaa Active"
      : "Show Walaa is inActive";

  res.status(200).json({
    message: v,
    status: 200,
})



})
