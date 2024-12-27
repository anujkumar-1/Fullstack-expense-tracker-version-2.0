import User from "../models/User.js"
import ForgetPassword from "../models/Forgetpassword.js"
import nodemailer from "nodemailer"
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";
 
const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.NODEMAILER_USER_EMAIL,
    pass: process.env.NODEMAILER_GMAIL_PASSKEY,
  },
});


export async function sendMail(to, sub, msg, id){
    await transporter.sendMail({
        to: to,
        subject: sub,
        text: msg,
        html: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset Password</a>`, // html body
    })
}


export const forgetPasswordReq = async(req, res) =>{
    try {
        const email = req.body.email
        console.log(email)
        console.log("req.body", req.user)
        const user = await User.findOne({where: {email}})
        console.log(user)
        if(user){
            const id = uuidv4()
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

export const resetPasswordReq = async (req, res) => {
    try {
        const uid = req.params.id
        const Fpid = await ForgetPassword.findOne({where: {id: uid}})
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
                    body {
                        margin: 0;
                        font-family: 'Arial', sans-serif;
                        background: linear-gradient(135deg, rgb(224, 247, 250), rgb(108, 99, 255));
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        color: #333;
                    }

                    .container {
                        background: white;
                        padding: 2rem;
                        border-radius: 10px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        max-width: 320px;
                        width: 100%;
                    }

                    .reset-password-form h1 {
                        font-size: 1.8rem;
                        margin-bottom: 1.5rem;
                        color: rgb(108, 99, 255);
                        text-align: center;
                    }

                    .input-group {
                        margin-bottom: 1.5rem;
                        position: relative;
                    }

                    .input-group label {
                        font-size: 0.9rem;
                        color: #555;
                        margin-bottom: 0.5rem;
                        display: block;
                    }

                    .input-group input {
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        font-size: 1rem;
                        outline: none;
                        transition: all 0.3s ease;
                    }

                    .input-group input:focus {
                        border-color: rgb(108, 99, 255);
                        box-shadow: 0 0 4px rgba(108, 99, 255, 0.5);
                    }

                    .input-group .toggle-password {
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        cursor: pointer;
                        font-size: 1.2rem;
                        color: #888;
                        transition: color 0.3s ease;
                    }

                    .input-group .toggle-password:hover {
                        color: rgb(108, 99, 255);
                    }

                    button {
                        width: 100%;
                        padding: 0.75rem;
                        border: none;
                        border-radius: 8px;
                        background: #ffa116;
                        color: white;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: background 0.3s ease;
                    }

                    button:hover {
                        background: rgb(88, 79, 230);
                    }
                    </style>
                </head>

                <body>
                    <div class="container" id="container">
                        <form class="reset-password-form" action="/password/updatepassword/${uid}" method="get">
                            <h1>Reset Password</h1>
                            <div class="input-group">
                                <label for="resetPassword">New Password</label>
                                <input type="password" name="resetPassword" id="resetPassword" placeholder="Enter new password">
                            </div>
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

export const updatePasswordReq = async(req, res)=>{
    const saltrounds = 10
    const newPassword = req.query.resetPassword
    const uuid = req.params.resetpasswordid
    const activeUser = await ForgetPassword.findOne({where: {id: uuid}})
    bcrypt.hash(newPassword, saltrounds, async(err, hash)=>{
        if(err){
            throw new Error("Something went wrong")
        }
        const data = await User.findOne({where:{id: activeUser.userId}})
        const updatingPassword = await data.update({password: hash})
        res.status(200).json({user: data, newPassword: hash, updatingPassword})
    })
}
