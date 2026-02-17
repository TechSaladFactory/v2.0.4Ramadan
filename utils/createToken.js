const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const ApiErrors = require("../utils/apiErrors");

exports.createToken = asyncHandler(async ( userid ) => {
  if (!userid) {

    throw new Error("User ID is required to create a token.");
  }

  // Ensure userid is a string
  const token = jwt.sign(
    { id: userid.toString() },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.EXPIRESIN }
  );

  return token;
});
