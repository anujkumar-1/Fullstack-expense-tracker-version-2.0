const expenseDataControllers = require("../controllers/ExpenseData")
const authMiddleware = require("../middleware/Auth")

const express=require("express")
const router=express.Router()

router.get("/downloadS3Data", authMiddleware.auth, expenseDataControllers.downloadExpense)

module.exports=router