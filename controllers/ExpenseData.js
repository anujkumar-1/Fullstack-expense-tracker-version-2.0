const expenseTable = require("../models/Expense")
const User = require("../models/User")
const sequelize = require("../utils/Database")
const Income = require("../models/Income")



const jwt = require("jsonwebtoken")
const AWS = require("aws-sdk");
require('aws-sdk/lib/maintenance_mode_message').suppress = true;



const uploadToS3 = async (data, filename)=>{
    const IAM_USER_KEY = "AKIAZ3MGM5EXYDYWZIWW"
    const IAM_USER_SECRET = "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";
    const BUCKET_NAME = "myexpensetrackingapp05";

    const S3Intializaion = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    })

    
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: "public-read"
    }

    return new Promise((resolve, reject)=>{
        S3Intializaion.upload(params, (err, s3response)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(s3response.Location)
                
            }
        })
    })
     

    


}

const expensePostData  = async(req, res)=>{
    try {
        var t = await sequelize.transaction()
        console.log("req.user", req.user);
        const amount = req.body.amount
        const description = req.body.description
        const category = req.body.category
        const token = req.header("Authorization")
        console.log("expensePostData :",token);
        const response = await expenseTable.create({amount:amount, description:description, category: category, userInfoId: req.user.userId}, { transaction: t })
        const updatedCost = Number(req.totalCost.totalCost) + Number(amount)
        const updatedTotalCost = await User.update({totalCost: updatedCost}, {where:{id: req.user.userId}, transaction: t})
        await t.commit()
        res.status(201).json({data:response, totalAmount:updatedCost, updatedTotalCost})
    } catch (error) {
        await t.rollback()
        console.log(error)
    }
}


const expenseGetData = async(req, res, next)=>{
    try {
        const page = +req.params.pageId;
         
        let arr = []
        const rowsPerPage = +req.query.rowsPerPage
        const rowsPerPageFrmExpense = Math.floor(rowsPerPage* 4/5)
        const rowsPerPageFrmIncome = Math.floor(rowsPerPage* 1/5)


        console.log("req.user :", req.user)
        const response4Expense = await expenseTable.findAll({
            where:{userInfoId: req.user.userId},
            limit : rowsPerPageFrmExpense,
            offset : (page-1)*rowsPerPageFrmExpense
        })

        const response4Income = await Income.findAll({
            where:{userInfoId: req.user.userId},
            limit : rowsPerPageFrmIncome,
            offset : (page-1)*rowsPerPageFrmIncome
        })

        if((response4Income.length !=rowsPerPageFrmIncome) && (response4Expense.length == rowsPerPageFrmExpense)){
            const deficitInIncomeData = rowsPerPageFrmIncome - response4Income.length
           const defecitedExpenseData4Income = await expenseTable.findAll({
                where:{userInfoId: req.user.userId},
                limit : deficitInIncomeData,
                offset : (page-1)*rowsPerPageFrmExpense
            
            })
            
        arr= [...response4Expense, ...response4Income, ...defecitedExpenseData4Income]
        }
        else if ((response4Expense.length!= rowsPerPageFrmExpense) && (response4Income.length == rowsPerPageFrmIncome)){
            const deficitInExpenseData = rowsPerPageFrmExpense - response4Expense.length 
            const defecitedIncomeData4Expense = await Income.findAll({
                where:{userInfoId: req.user.userId},
                limit : deficitInExpenseData,
                offset : (page-1)*rowsPerPageFrmIncome
            })
            arr= [...response4Expense, ...response4Income, ...defecitedIncomeData4Expense]
        }
        else{
            arr= [...response4Expense, ...response4Income]
        }

        console.log(arr.length)

        
        const sortedArray = sortArr(arr)
        
        


        console.log("response4Income.length", response4Income.length)
        
        const allExpenseCount = await expenseTable.count({where: {userInfoId: req.user.userId}})
        const notFetchedExpense = allExpenseCount - rowsPerPage*page
        const allIncomeCount = await Income.count({where: {userInfoId: req.user.userId}})
        const totalAmount = await expenseTable.sum("amount", {where: {userInfoId: req.user.userId}})
        res.status(200).json({allData:sortedArray, arr ,totalExpense: totalAmount, allExpenseCount, allIncomeCount, notFetchedExpense,currentPage: page, lastPage: Math.ceil((allExpenseCount + allIncomeCount)/ rowsPerPage)})


    } catch (error) {
        console.log("expenseGetData :", error)
    }
}


const sortArr = function(arr){
    return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

}

const downloadExpense = async(req, res)=>{
    try{

            if(req.user.ispremiumuser == true){
                const filename = `Expense - ${req.user.name}-${new Date()}.txt`
                const getAllIncomeData = await Income.findAll({where:{userInfoId: req.user.userId}})
                const getAllExpenseData = await expenseTable.findAll({where:{userInfoId: req.user.userId}})
                const allData = [...getAllIncomeData, ...getAllExpenseData]
                const sortedArray = sortArr(allData)
                const stringifiedData = JSON.stringify(sortedArray)
                const s3Data = await uploadToS3(stringifiedData, filename)
                console.log("s3Data", s3Data)
                res.status(200).json({data: s3Data})
            }
            else{
                res.status(401).json({message: "Unauthorized"})
            }
        
    }catch (error) {
        console.log(error)
    }
    
}

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

module.exports = {
    expensePostData,
    expenseGetData,
    downloadExpense,
    deleteExpense
}