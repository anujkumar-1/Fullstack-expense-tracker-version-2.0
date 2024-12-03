const forgetPasswordController = require("../controllers/ForgetPassword")
const authMiddleware = require("../middleware/Auth")

const express=require("express")
const router=express.Router()

router.post("/password/forgotpassword", authMiddleware.auth, forgetPasswordController.forgetPasswordReq)
router.use("/resetpassword/:id", authMiddleware.auth,  forgetPasswordController.resetPasswordReq)
router.get("/updatepassword/:resetpasswordid", authMiddleware.auth, forgetPasswordController.updatePasswordReq)


module.exports=router