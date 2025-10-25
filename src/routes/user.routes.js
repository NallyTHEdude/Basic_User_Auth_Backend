import { Router } from "express";
import { getUserDetails, updateUserDetails, deleteUserAccount } from "../controllers/user.controllers.js";
import { userDeleteAccountValidator, userUpdateValidator } from "../validators/user.validators.js";
import verifyJWT from "../middlewares/auth.middleware.js";


const router = Router();

// user routes
router.route('/profile').get(verifyJWT,getUserDetails);
router.route('/update').put(verifyJWT,userUpdateValidator(),updateUserDetails);
router.route('/delete-account').delete(verifyJWT,userDeleteAccountValidator(), deleteUserAccount);


export default router;