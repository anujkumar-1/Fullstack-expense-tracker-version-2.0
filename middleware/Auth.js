const User = require("../models/User")


const jwt = require("jsonwebtoken")

const auth = async (req, res, next)=>{
    try {
        const token = req.header("Authorization")
        console.log("auth token", token);

        const user= jwt.verify(token, process.env.JWT_TOKEN_SECRET)

        console.log(user)
        const totalCost = await User.findByPk(user.userId)
        console.log("totalCost :", totalCost)
        req.totalCost = totalCost
        req.user = user
    

        console.log("UserID", user.userId, totalCost);
        next()
    } catch (error) {
        console.log("auth :", error)
        res.status(500).json({message: "internal server error"})
    }
    



}

module.exports={
    auth
}