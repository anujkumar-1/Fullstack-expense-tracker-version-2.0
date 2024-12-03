const expenseTable = require("../models/Expense")
const User = require("../models/User")
const sequelize = require("../utils/Database")


const deleteExpense = async (req, res, next)=>{
    try {
        const t = await sequelize.transaction()
        const expenseId = +req.params.expenseid
        const expenseamount = await expenseTable.findOne({where:{id:expenseId}})
        const new_total_cost = Number(req.totalCost.totalCost) - Number(expenseamount.amount)
        console.log(new_total_cost)
        const updatedTotalCost = await User.update({totalCost: new_total_cost}, {where:{id: req.user.userId}, transaction: t})
        const deletedData = await expenseTable.destroy({where: {id:expenseId}, transaction: t})
        console.log(deletedData)
        await t.commit()
        res.status(200).json({updatedTotalCost})
    } catch (error) {
        await t.rollback()
        throw new Error(error)
    }
    
}

module.exports= {
    deleteExpense
}