import expenseTable from "../models/Expense.js";
import User from "../models/User.js";
import Income from "../models/Income.js";
import s3Urls from "../models/s3Url.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export const uploadToS3 = async (data, filename) => {
  const IAM_USER_KEY = "AKIAZ3MGM5EXYDYWZIWW";
  const IAM_USER_SECRET = "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";
  const BUCKET_NAME = "myexpensetrackingapp05";

  const client = new S3Client({
    region: "us-east-1",
    credentials: {
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
    },
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };
  const command = new PutObjectCommand(params);
  try {
    const response = await client.send(command);
    if (response.$metadata.httpStatusCode == 200) {
      let url = `https://${params.Bucket}.s3.us-east-1.amazonaws.com/${params.Key}`;
      return url;
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

export const expensePostData = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const token = req.header("Authorization");
    const response = await expenseTable.create({
      amount: amount,
      description: description,
      category: category,
      userInfoId: req.user.userId,
    });
    const updatedCost = Number(req.totalCost.totalCost) + Number(amount);
    const updatedTotalCost = await User.update(
      { totalCost: updatedCost },
      { where: { id: req.user.userId } }
    );
    res
      .status(201)
      .json({ data: response, totalAmount: updatedCost, updatedTotalCost });
  } catch (error) {
    console.log(error);
  }
};

export const expenseGetData = async (req, res, next) => {
  try {
    const page = +req.params.pageId;
    const rowsPerPage = +req.query.rowsPerPage;
    const dailyWeeklyYearly = req.query.dailyWeeklyMonthlyYearlyData;
    const rowsPerPageFrmExpense = Math.floor((rowsPerPage * 4) / 5);
    const rowsPerPageFrmIncome = Math.floor((rowsPerPage * 1) / 5);
    let arr = [];
    const today = new Date();
    let startTime = null;
    let endTime = null;

    switch (dailyWeeklyYearly) {
      case "daily":
        startTime = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        endTime = new Date(startTime.getTime() + 86399999); // Add one day minus 1ms
        break;
      case "weekly":
        endTime = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        startTime = new Date(endTime.getTime() - 7 * 86400000); // Subtract 7 days
        break;
      case "monthly":
        startTime = new Date(today.getFullYear(), today.getMonth(), 1);
        endTime = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;
      default:
        startTime = new Date(today.getFullYear(), 0, 1);
        endTime = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
    }
    console.log(startTime, endTime);

    const response4Expense = await expenseTable.findAll({
      where: {
        userInfoId: req.user.userId,
        createdAt: {
          [Op.between]: [startTime, endTime],
        },
      },
      attributes: ["id", "amount", "description", "category", "createdAt"],
      order: [["createdAt", "ASC"]],
      limit: rowsPerPageFrmExpense,
      offset: (page - 1) * rowsPerPageFrmExpense,
    });

    const response4Income = await Income.findAll({
      where: {
        userInfoId: req.user.userId,
        createdAt: {
          [Op.between]: [startTime, endTime],
        },
      },
      attributes: ["id", "amount", "description", "category", "createdAt"],
      order: [["createdAt", "ASC"]],
      limit: rowsPerPageFrmIncome,
      offset: (page - 1) * rowsPerPageFrmIncome,
    });

    if (
      response4Income.length != rowsPerPageFrmIncome &&
      response4Expense.length == rowsPerPageFrmExpense
    ) {
      const deficitInIncomeData = rowsPerPageFrmIncome - response4Income.length;
      const defecitedExpenseData4Income = await expenseTable.findAll({
        where: {
          userInfoId: req.user.userId,
          createdAt: {
            [Op.between]: [startTime, endTime],
          },
        },
        attributes: ["id", "amount", "description", "category", "createdAt"],
        order: [["createdAt", "ASC"]],
        limit: deficitInIncomeData,
        offset: (page - 1) * rowsPerPageFrmExpense,
      });

      arr = [
        ...response4Expense,
        ...response4Income,
        ...defecitedExpenseData4Income,
      ];
    } else if (
      response4Expense.length != rowsPerPageFrmExpense &&
      response4Income.length == rowsPerPageFrmIncome
    ) {
      const deficitInExpenseData =
        rowsPerPageFrmExpense - response4Expense.length;
      const defecitedIncomeData4Expense = await Income.findAll({
        where: {
          userInfoId: req.user.userId,
          createdAt: {
            [Op.between]: [startTime, endTime],
          },
        },
        attributes: ["id", "amount", "description", "category", "createdAt"],
        order: [["createdAt", "ASC"]],
        limit: deficitInExpenseData,
        offset: (page - 1) * rowsPerPageFrmIncome,
      });
      arr = [
        ...response4Expense,
        ...response4Income,
        ...defecitedIncomeData4Expense,
      ];
    } else {
      arr = [...response4Expense, ...response4Income];
    }

    const sortedArray = sortArr(arr);

    const allExpenseCount = await expenseTable.count({
      where: {
        userInfoId: req.user.userId,
        createdAt: {
          [Op.between]: [startTime, endTime],
        },
      },
    });

    const allIncomeCount = await Income.count({
      where: {
        userInfoId: req.user.userId,
        createdAt: {
          [Op.between]: [startTime, endTime],
        },
      },
    });
    const totalAmount = await expenseTable.sum("amount", {
      where: {
        userInfoId: req.user.userId,
      },
    });
    const totalIncome = await Income.sum("amount", {
      where: {
        userInfoId: req.user.userId,
      },
    });
    res.status(200).json({
      allData: sortedArray,
      totalExpense: totalAmount,
      totalIncome: totalIncome,
      allExpenseCount,
      allIncomeCount,
      currentPage: page,
      lastPage: Math.ceil((allExpenseCount + allIncomeCount) / rowsPerPage),
    });
  } catch (error) {
    console.error("expenseGetData :", error);
  }
};

export const sortArr = function (arr) {
  return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export const downloadExpense = async (req, res) => {
  try {
    const uuid = uuidv4();
    if (req.user.ispremiumuser == true) {
      const filename = `Expense-${req.user.name}-${uuid}.txt`;
      const getAllData = await User.findOne({
        where: {
          id: req.user.userId,
        },
        attributes: [
          "username",
          "email",
          "ispremiumuser",
          "totalCost",
          "totalIncome",
        ],
      });
      const getAllExpense = await expenseTable.findAll({
        where: {
          userInfoId: req.user.userId,
        },
        attributes: ["amount", "description"],
      });
      const allData = [getAllData, ...getAllExpense];
      const stringifiedData = JSON.stringify(allData);
      const s3Data = await uploadToS3(stringifiedData, filename);

      const s3Link = await s3Urls.create({
        link: s3Data,
        userInfoId: req.user.userId,
      });
      console.log("s3Data", s3Data);
      res.status(200).json({ data: s3Data });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
  }
};
