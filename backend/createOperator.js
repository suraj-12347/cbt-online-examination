
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/adminModel.js";

const createOperator = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/cbt");

    const operator = await Admin.create({
      name: "Operator",
      email: "operator@cbt.com",
      password: await bcrypt.hash("operator123", 10),
      role: "operator",
      status: "active",
    });

    console.log("Operator created successfully");
    console.log(operator);

    process.exit(0);
  } catch (error) {
    console.error("Error creating operator:", error.message);
    process.exit(1);
  }
};

createOperator();
