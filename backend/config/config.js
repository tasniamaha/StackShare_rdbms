// config/config.js
require("dotenv").config();

module.exports = {
  // Database Configuration
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "StackShare",

  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || "stackshare-secret-key-2024",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",

  // App Configuration
  APP_NAME: "StackShare",
  APP_VERSION: "1.0.0",
};
