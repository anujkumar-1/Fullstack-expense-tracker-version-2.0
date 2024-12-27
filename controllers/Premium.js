import Order from "../models/Order.js";
import User from "../models/User.js";
import Razorpay from "razorpay";
import jwt from 'jsonwebtoken';
import { Op } from "sequelize";


export const buyPremiumGetReq = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = 5000;
    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      try {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        console.log(req.user);
        const data = await Order.create({orderid: order.id, status: "PENDING", userInfoId: req.user.userId});
        res.status(201).json({ order, key_id: rzp.key_id, status: "PENDING", data });
      } catch (error) {
        throw new Error(error);
      }
    });
  } catch (error) {
    console.log("Something went wrong in buyPremiumGetReq");
  }
};

export const updatePremiumReqSuccess = async function (req, res) {
  try {
    const token = req.header("Authorization");
    console.log(token);
    console.log("req.user", req.user);
    const { order_id, payment_id } = req.body;
    const response = await Order.findOne({ where: { orderid: order_id } });
    const promise1 = await response.update({
      paymentstatus: payment_id,
      status: "SUCESSFULL"
      
    });
    const promise2 = await User.findOne({ where: { id: req.user.userId } });
    const promise3 = await promise2.update({ ispremiumuser: true});
    console.log(promise3.ispremiumuser);
    res
      .status(200)
      .json({
        sucess: true,
        message: "you are a premium user",
        promise1,
        promise2,
        promise3,
        token: jwt.sign(
          {
            userId: req.user.userId,
            name: req.user.name,
            ispremiumuser: promise3.ispremiumuser,
            totalCost: promise3.totalCost
          },
          process.env.JWT_TOKEN_SECRET
        ),
      });
  } catch (error) {
    throw new Error(error);
  }
};

export const updatePremiumReqFailed = async function (req, res) {
  try {
    const { order_id, payment_id } = req.body;
    const response = await Order.findOne({ where: { orderid: order_id } });
    const promise1 = await response.update({
      paymentstatus: payment_id,
      status: "Failed"
    });
    t.commit()
    res.status(200).json({ sucess: false, message: "Transaction Failed" });
  } catch (error) {
    t.rollback()
    throw new Error(error);
  }
};

export const getAllLeaderboardUser = async function (req, res) {
  try {
    const arrOfAllUsers = await User.findAll({
      
      where:{ 
        totalCost: {
          [Op.ne]: 0
        }

      },
      attributes: ["id","username", "totalCost"],
      order: [["totalCost", "DESC"]],
    });

    res.status(200).json({ arrOfAllUsers, user: req.user });
  } catch (error) {
    console.log(error);
    throw new Error("Problem in getAllLeaderboardUser");
  }
};

