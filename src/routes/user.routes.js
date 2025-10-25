import { Router } from "express";
import { updateUserDetails } from "../controllers/user.controllers.js";
import verifyJWT from "../middlewares/auth.middleware.js";


const router = Router();

// user routes
router.route('/update').put(verifyJWT,updateUserDetails);
router.route('/delete').delete(verifyJWT,deleteUserAccount);


export default router;