import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";



export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        return next();
    }

    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push(
        {
            [err.param]: err.msg
        }));

        throw new AppError(422, "Recieved data is invalid", extractedErrors);
}