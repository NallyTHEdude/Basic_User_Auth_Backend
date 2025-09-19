import {User} from "../models/user.models.js";
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendEmail, emailVerificationMailGenContent } from '../utils/mail.js';


const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};
    }catch(error){
        throw new ApiError(500, "Failed to generate tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role} = req.body;
    const existingUser = await User.findOne({
        $or: [{email}, {username}]
    });
    
    // if user already exists, throw error
    if(existingUser){
        throw new ApiError(409, "User with email or username already exists",[]);
    }

    // if user does not exist, create new user
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
    });

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({validateBeforeSave: false});

    await sendEmail({
        email: user.email,
        subject: 'Please verify your email',
        mailgenContent: emailVerificationMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        ),
         
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
    if(!createdUser){
        throw new ApiError(500, "User registration failed");
    }

    return res
    .status(201)
    .json(new ApiResponse(
        201,
        {user: createdUser}),
        "User registered successfully"
    )

});

export {registerUser}
