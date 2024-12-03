const incomeDataController = require("../controllers/Income")
const authMiddleware = require("../middleware/Auth")

const express=require("express")
const router=express.Router()

router.post("/registerIncome",authMiddleware.auth, incomeDataController.IncomePostReq)
router.get("/getIncome", incomeDataController.IncomeGetReq)
router.get("/abc/:pageId", incomeDataController.abcIncome)

module.exports=router