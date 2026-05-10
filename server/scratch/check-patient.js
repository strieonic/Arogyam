import mongoose from "mongoose";
import dotenv from "dotenv";
import Patient from "../models/Patient.js";

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const identifier = "8799922377";
    const patient = await Patient.findOne({
      $or: [
        { phone: identifier },
        { email: identifier },
        { healthId: identifier }
      ]
    });

    if (patient) {
      console.log("Patient Found!");
      console.log("Name:", patient.name);
      console.log("Email:", patient.email);
      console.log("Phone:", patient.phone);
    } else {
      console.log("Patient not found with identifier:", identifier);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

check();
