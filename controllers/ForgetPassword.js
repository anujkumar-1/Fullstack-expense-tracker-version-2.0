const User = require("../models/User")
const ForgetPassword = require("../models/Forgetpassword")
const sequelize = require("../utils/Database");

const nodemailer = require("nodemailer");
const uuid = require("uuid")

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.NODEMAILER_USER_EMAIL,
    pass: process.env.NODEMAILER_GMAIL_PASSKEY,
  },
});


async function sendMail(to, sub, msg, id){
    await transporter.sendMail({
        to: to,
        subject: sub,
        text: msg,
        html: `<a href="http://localhost:3000/resetpassword/${id}">Reset Password</a>`, // html body
    })
}


const forgetPasswordReq = async(req, res) =>{
    try {
        const email = req.body.email
        console.log(email)
        console.log("req.body", req.user)
        const user = await User.findOne({where: {email}})
        if(user){
            const id = uuid.v4()
            const msg = await sendMail(email, `Reset Password for ${email}`, "Click on the link below", id)
            const data=await ForgetPassword.create({id: id, userId: req.user.userId, isActive: true})
            console.log(id)
            res.status(200).json({msg})

        }else{
            res.status(404).json({message: "User not found"})
        }
        
        
    } catch (error) {
        console.log(error)
        res.status(500).json()

    }
}

const resetPasswordReq = async (req, res) => {
    try {
        const uid = req.params.id
        console.log("uid", uid)
        const Fpid = await ForgetPassword.findOne({where: {id: uid}})

        console.log("Fpid :", Fpid)
        if(Fpid){
            await Fpid.update({isActive: false})
            res.status(200).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Password</title>
                    <style>
                    *{
                        margin: 0;
                        padding: 0;
                        font-family: Arial, Helvetica, sans-serif;
                        box-sizing: border-box;
                    }

                    .overLay {
                        width: 100%;
                        height: 100vh;
                        position: absolute;
                        background: rgba(0, 0, 0, 0.5);
                        top:0;
                        z-index: -1;
                        opacity: 0;
                    }


                    .container{
                        width: 350px;
                        background-color: white;
                        padding:30px 20px;
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        box-shadow: 0px 0px 10px 7px #ccc;
                    }

                    .container input{
                        width: 100%;
                        height: 35px;
                        margin-bottom: 15px;
                    }



                    #resetPasswordButton{
                        background-color: black;
                        color: white;
                        padding: 10px 15px;
                        margin-bottom: 15px;
                    }



                    .container input:focus-visible{
                        outline: 3px solid #28ebd6;
                    }



                    h1{
                        position:absolute;
                        font-size: 36px;
                        line-height: normal;
                        font-weight: bold;
                        font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        left: 50%;
                        top: 30%;
                        transform: translate(-50%, -50%);
                    
                    }
                    </style>
                </head>

                <body>
                    <div>
                        <h1>Password Reset</h1>
                    </div>
                    <div class="overLay"></div>
                    <div class="container" id="container">
                        <form action="/updatepassword/${uid}" method="get">
                            <label for="resetPassword">Enter new password :</label>
                            <input type="password" id="resetPassword" name="resetPassword" required>
                            <br>
                            <button id="resetPasswordButton">Reset Password</button>
                        </form>
                    </div>
                </body>
                </html>
    
            `)
            res.end()
        }

    } catch (error) {
        console.log(error)
    }
    
    
}

updatePasswordReq = async(req, res)=>{
    const newPassword = req.query.resetPassword
    const uuid = req.params.resetpasswordid

    console.log(newPassword, uuid, req.user)
    res.end()
}

module.exports = {
    forgetPasswordReq,
    resetPasswordReq,
    updatePasswordReq
}
