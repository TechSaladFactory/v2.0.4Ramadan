const ApiErrors = require("../utils/apiErrors");
const jwt = require('jsonwebtoken'); // Ensure you have the JWT library imported
const {UserModel} = require("../models/userModel"); // Assuming you have a User model

const getUserFromToken = async (req, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiErrors("Authorization header must contain a Bearer token", 401));
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new ApiErrors("Token has expired", 403));
        }
        return next(new ApiErrors("Invalid token", 403));
    }

    if (!decoded || !decoded.id) {
        return next(new ApiErrors("Token must contain a user ID", 400));
    }

    // Find the user based on the ID in the decoded token
    const user = await UserModel.findById(decoded.id);
    if (!user) {
        return next(new ApiErrors("User not found", 404));
    }

    return user;
};

module.exports = { getUserFromToken };
