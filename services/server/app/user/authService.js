const User = require("../models/authModel");

const loginUser = async (credentials) => {
  try {
    const user = await User.findOne({
      username: credentials.username,
    });
    if (!user) {
      return { error: "Invalid credentials" };
    }
    const isMatch = user.comparePassword(credentials.password);
    if (!isMatch) {
      return { error: "Incorrect password" };
    } else {
      return {
        message: "Login successful",
        username: user.username,
      };
    }
  } catch (err) {
    console.error("Error during login:", err);
    return;
  }
};

const connectWithRetry = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongodb:27017/user";

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000, // Give up initial connection after 10s
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

function generateAuthToken(username) {
  const jwt = require("jsonwebtoken");

  const secretKey = process.env.ACCESS_TOKEN_SECRET;

  const token = jwt.sign(
    {
      name: username,
      role: "admin",
    },
    secretKey,
    { expiresIn: "15m" }
  );

  console.log("Generated Token:", token);
  return token;
}

function generateRefreshToken(username) {
  const jwt = require("jsonwebtoken");

  const secretKey = process.env.REFRESH_TOKEN_SECRET;

  const token = jwt.sign(
    {
      sub: username,
      name: username,
    },
    secretKey,
    { expiresIn: "3d" }
  );

  console.log("Generated Token:", token);
  return token;
}

module.exports = {
  generateAuthToken,
  generateRefreshToken,
  loginUser,
  connectWithRetry,
};
