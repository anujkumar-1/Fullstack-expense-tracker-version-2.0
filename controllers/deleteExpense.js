import expenseTable from "../models/Expense.js"
import User from "../models/User.js"
import Income from "../models/Income.js"


const deleteExpense = async (req, res, next)=>{
    try {
        
        const expenseId = +req.query.id
        const expCategory = req.query.category
        const expAmount = req.query.amount
        const expDescription = req.query.description
        
        if(Number.isInteger(expenseId)){
            if(expCategory === "Income"){

            }
            else{

            }
        }
        else{
            if(expCategory === "Income"){

            }
            else{

            }
        }
        const expenseamount = await expenseTable.findOne({where:{id:expenseId}})
        const new_total_cost = Number(req.totalCost.totalCost) - Number(expenseamount.amount)
        console.log(new_total_cost)
        const updatedTotalCost = await User.update({totalCost: new_total_cost}, {where:{id: req.user.userId}})
        const deletedData = await expenseTable.destroy({where: {id:expenseId}})
        console.log(deletedData)
        
        res.status(200).json({updatedTotalCost})
    } catch (error) {
        
        throw new Error(error)
    }
    
}

export default deleteExpense
