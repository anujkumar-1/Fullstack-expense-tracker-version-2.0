const userControllers = require("../controllers/User")

const express=require("express")
const router=express.Router()


router.post("/signup", userControllers.signUp)
router.get("/login", userControllers.login)


module.exports=router