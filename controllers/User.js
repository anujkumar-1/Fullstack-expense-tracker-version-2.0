import User from "../models/User.js";
import arcjet, { validateEmail } from "@arcjet/node";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

export function generateAccessTokens(id, name, ispremiumuser, totalCost){
    const token = jwt.sign({userId: id, name:name, ispremiumuser, totalCost}, "AK47")
    return token
}

export const aj = arcjet({
    // Get your site key from https://app.arcjet.com and set it as an environment
    // variable rather than hard coding.
    key: process.env.ARCJET_KEY,
    rules: [
      validateEmail({
        mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
        // block disposable, invalid, and email addresses with no MX records
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      }),
    ],
  });
  

export const signUp = async (req, res)=>{
    try {
        // const t = await sequelize.transaction()
        const username = req.body.username
        const email = req.body.email
        const password = req.body.password
        const saltrounds = 10

        console.log("Email received: ", email, process.env.ARCJET_KEY);

        const decision = await aj.protect(req, {email});
        console.log("Arcjet decision", decision.isDenied());

        for (const result of decision.results){
            console.log("Rule Result", result);
        
            if (result.reason.isEmail()) {
              console.log("Email rule", result);
            }
        }

        if (decision.isDenied()) {
        
            res.status(403).json({message: 'Forbidden'});
        }else {

            const userAlreadyExist = await User.findAll({where: {email: email}});
            console.log("userAlreadyExist", userAlreadyExist.length)

            if(userAlreadyExist.length > 0){
                res.status(401).json({message: 'User Already Exist. Try Another'});
                
            }
            else{
                bcrypt.hash(password, saltrounds, async(err, hash)=>{
                    if(err){
                    
                        throw new Error("Something went wrong")
                    }
                    const data = await User.create({username: username, email: email, password: hash})
                    // await t.commit()
                    res.status(201).json({user: data})
                    
                })
                
            }
        }

    } catch (error) {
        // await t.rollback()
        console.log("signUp :", error)
    }
}

export const login = async (req, res)=>{
    try {
        const email = req.query.verifyEmail
        const password = req.query.verifyPassword
        console.log(email, password)
        const user = await User.findAll({
            where: {
              email: email
            }
        });
        console.log(user)

        if (user.length > 0) {
            bcrypt.compare(password, user[0].password, function(err, result) {
                // result == true
                if(err){
                    throw new Error("Something went wrong")
                }
                if(result===true){
                    console.log("user result", user[0].id, user[0].username, user[0].email, user[0].ispremiumuser, user[0].totalCost)
                    res.status(200).json({user: user, message: "User logged in sucessfully", token: generateAccessTokens(user[0].id, user[0].username, user[0].ispremiumuser, user[0].totalCost)});
                }
                else{
                    res.status(401).json({message: "User not authorized"});
                }
            });
            
            
        }else {
            res.status(404).json({ message: 'User not found' });
        }
        
        
    } catch (error) {
        console.log("login :", error)
    }
}