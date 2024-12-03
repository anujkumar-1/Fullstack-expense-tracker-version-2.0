const buyPremiumControllers = require("../controllers/Premium")
const authMiddleware = require("../middleware/Auth")

const express=require("express")
const router=express.Router()

router.get("/buyPremiumMembership", authMiddleware.auth, buyPremiumControllers.buyPremiumGetReq)
router.post("/updatePremiumMembership", authMiddleware.auth, buyPremiumControllers.updatePremiumReqSuccess)
router.post("/updateErrorPremiumMembership", authMiddleware.auth, buyPremiumControllers.updatePremiumReqFailed)
router.get("/leaderboardAllUser", authMiddleware.auth, buyPremiumControllers.getAllLeaderboardUser)


module.exports=router