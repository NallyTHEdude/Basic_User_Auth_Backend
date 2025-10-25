import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailChangedMailGenContent, accountDeletionMailGenContent } from "../utils/mail.js";
import { User } from '../models/user.models.js';

const updateUserDetails = asyncHandler(async (req, res) => {
    let {username, fullName, email} = req.body;
    if(!fullName?.trim()){
        throw new ApiError(400, 'Full name is required');
    }
    if(!email?.trim()){
        throw new ApiError(400, 'Email is required');
    }
    if(!username?.trim()){
        throw new ApiError(400, 'Username is required');
    }

    username = username.toLowerCase();
    email = email.toLowerCase();;
    
    const existingUser = await User.findOne({
        _id: { $ne: req.user._id },
        $or: [
            { email: email.trim() },
            { username: username.trim() },
        ]
    });
    // if user with the same email or username already exists
    if(existingUser){
        if(existingUser.email === email.trim()){
            throw new ApiError(400, 'Email already exists');
        }
        if(existingUser.username.toLowerCase() === username.trim()){
            throw new ApiError(400, 'Username is taken, select another username');
        }
    }

    // update isEmailVerified,emailVerificationToken and emmailVerificationExpiry if email is changed
    const emailChanged = email.trim() !== req.user.email;
    const updatedData = {
        $set: {
            username: username.trim(),
            fullName: fullName.trim(),
            email: email.trim(),
            isEmailVerified: emailChanged ? false : req.user.isEmailVerified,
        }
    }
    if(emailChanged){
        updatedData.$unset = {
            emailVerificationToken: "",
            emailVerificationExpiry: ""
        }

        await sendEmail({
            email: req.user.email,
            subject: 'Email Change Notification',
            mailgenContent: emailChangedMailGenContent(
                req.user.username,
                `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${req.user.refreshToken}`,
                email.trim()
            ),
        });
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        updatedData,
        { new: true, runValidators: true }
    ).select(
        '-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationExpiry'
    );
    if(!user){
        throw new ApiError(404, 'user not found');
    }

    res.status(200).json(
        new ApiResponse(
            200,
            { user },
            'User details updated successfully'
        )
    );
});

const deleteUserAccount = asyncHandler(async (req, res) => {
    const {password} = req.body;
    if(!password?.trim()){
        throw new ApiError(400, 'Password is required to delete your account');
    }
    
    const user = await User.findById(req.user._id).select('+password');
    if(!user){
        throw new ApiError(404, 'User does not exist in database');
    }
    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid){
        throw new ApiError(401, 'Invalid password');
    }

    const userEmail = user.email;
    const userName = user.username;
        
    await User.findByIdAndDelete(req.user._id);

    await sendEmail({
            email: userEmail,
            subject: 'Account Deletion Successful',
            mailgenContent: accountDeletionMailGenContent(userName),
        });

    // clear cookies
    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(
            new ApiResponse(
                200,
                null,
                'User account deleted successfully'
            )
    );
});


export {
    updateUserDetails,
    deleteUserAccount
}