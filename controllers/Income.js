import Income from "../models/Income.js"
import User from "../models/User.js"


 export const IncomePostReq = async(req, res)=>{
    try {
        // const t = await sequelize.transaction()
        console.log("req income", req.user);
        const {amount, description, category} = req.body
        const token = req.header("Authorization")
        console.log("IncomePostReq :",token);
        const postData = await Income.create({amount:amount, description:description, category: category, userInfoId: req.user.userId})
        const updatedIncome = Number(req.activeUser.totalIncome) + Number(amount)
        const updateTotalIncome = await User.update({totalIncome: updatedIncome}, {where:{id: req.user.userId}})
        
        
        // await t.commit()
        res.status(201).json({data:postData, totalIncome:updatedIncome, updateTotalIncome})
    } catch (error) {
        // await t.rollback()
        console.log(error)
    }

}
export const abcIncome = async(req, res)=>{
    try {
        console.log(req.params.pageId, req.query.pageId, req.query.username, req.header("Authorization"))
    } catch (error) {
        console.log(error)
    }
    res.end()
}
