const Income = require("../models/Income")
const User = require("../models/User")
const expenseTable = require("../models/Expense")
const sequelize = require("../utils/Database")


const jwt = require("jsonwebtoken")


IncomePostReq = async(req, res)=>{
    try {
        // const t = await sequelize.transaction()
        console.log("req income", req.user);
        const amount = req.body.amount
        const description = req.body.description
        const category = req.body.category
        const token = req.header("Authorization")
        console.log("IncomePostReq :",token);
        const postData = await Income.create({amount:amount, description:description, category: category, userInfoId: req.user.userId})
        const updatedIncome = Number(req.totalCost.totalIncome) + Number(amount)
        const updateTotalIncome = await User.update({totalIncome: updatedIncome}, {where:{id: req.user.userId}})
        
        
        // await t.commit()
        res.status(201).json({data:postData, totalIncome:updatedIncome, updateTotalIncome})
    } catch (error) {
        // await t.rollback()
        console.log(error)
    }

}

IncomeGetReq = async(req, res)=>{
    try {
        const page = +req.params.pageId
        console.log(page)
        console.log("req.user :", req.user)
        const response = await Income.findAll({
            where:{userInfoId: req.user.userId},
            limit : 3,
            offset : (page-1)*3
        }
        
        )
        console.log("res", response)
        
        const allIncomeCount = await Income.count({where: {userInfoId: req.user.userId}})
        const totalIncome = await Income.sum("amount", {where: {userInfoId: req.user.userId}})
        res.status(200).json({incomeData:response, totalIncome: totalIncome, dataCount: allIncomeCount})

        
    } catch (error) {
        console.log(error)
    }
}

const abcIncome = async(req, res)=>{
    try {
        console.log(req.params.pageId, req.query.pageId, req.query.username, req.header("Authorization"))
    } catch (error) {
        console.log(error)
    }
    res.end()
}
module.exports = {
    IncomePostReq,
    IncomeGetReq,
    abcIncome
}