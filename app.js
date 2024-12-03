const express = require("express")
const app= express()
const fs = require("fs")
const path = require("path")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")

const dotenv = require("dotenv")
dotenv.config()
const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {flags: "a"})

app.use(helmet())
app.use(compression())
app.use(morgan("combined", {stream: accessLogStream}))


const bodyParser = require("body-parser")
app.use(bodyParser.json())
const cors = require("cors")

const sequelize = require("./utils/Database")

const useroute=require("./routes/userRoutes")
const awsroute=require("./routes/AwsRoutes.js")
const premiumroute=require("./routes/PremiumRoutes.js")
const incomeroute=require("./routes/IncomeRoutes.js")
const expenseroute=require("./routes/ExpenseRoutes.js")
const passwordroute=require("./routes/PasswordRoutes.js")

app.use(cors())

app.use("/users", useroute)
app.use("/expenses", expenseroute)
app.use(premiumroute)
app.use(passwordroute)
app.use(incomeroute)
app.use(awsroute)


sequelize.sync().then(result=>{
    app.listen(3000, ()=>{
        console.log("Server is running on port 3000")
    })

    console.log("database connected sucessfully")
}).catch(err=>{
    console.log(err)
})
