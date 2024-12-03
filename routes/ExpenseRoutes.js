const expenseDataControllers = require("../controllers/ExpenseData")
const authMiddleware = require("../middleware/Auth")

const express=require("express")
const router=express.Router()

router.post("/expenseForm",authMiddleware.auth, expenseDataControllers.expensePostData)
router.get("/expenseAllData/:pageId",authMiddleware.auth ,expenseDataControllers.expenseGetData)
router.get("/downloadS3Data", authMiddleware.auth, expenseDataControllers.downloadExpense)
router.delete("/deleteExpense/:expenseid", authMiddleware.auth, expenseDataControllers.deleteExpense)


module.exports=router