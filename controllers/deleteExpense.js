import expenseTable from "../models/Expense.js"
import User from "../models/User.js"
import Income from "../models/Income.js"


const deleteExpense = async (req, res, next)=>{
    try {
        
        const expenseId = +req.query.id
        const activeUserId = +req.query.currentUser
        const expCategory = req.query.category
        const expAmount = req.query.amount
        const expDescription = req.query.description
        if(expCategory === "Income"){
            if(Number.isInteger(expenseId)){
                const delIncome = await Income.destroy({where:{
                    userInfoId: activeUserId,
                    id: expenseId
                }})
            }
            else{
                const deletedIncome = await Income.destroy({where:{
                    userInfoId: activeUserId,
                    category: expCategory,
                    amount: expAmount,
                    description: expDescription
                }})
            }
            const new_total_income = Number(req.activeUser.totalCost) - Number(expAmount)
            console.log(new_total_income)
            const updatedTotalCost = await User.update({totalIncome: new_total_income}, {where:{id: req.user.userId}})
            
            res.status(200).json({updatedTotalCost: updatedTotalCost})

            
            
        }
        else{
            if(Number.isInteger(expenseId)){
                const delExpense = await expenseTable.destroy({where:{
                    userInfoId: activeUserId,
                    id: expenseId
                }})
            }
            else{
                const deletedExpense = await expenseTable.destroy({where:{
                    userInfoId: activeUserId,
                    category: expCategory,
                    amount: expAmount,
                    description: expDescription
                }})
            }
            const new_total_cost = Number(req.activeUser.totalCost) - Number(expAmount)
            console.log(new_total_cost)
            const updatedTotalCost = await User.update({totalCost: new_total_cost}, {where:{id: req.user.userId}})
            
            res.status(200).json({updatedTotalCost: updatedTotalCost})

        }
                
        
    } catch (error) {
        throw new Error(error)
    }
    
}

export default deleteExpense
