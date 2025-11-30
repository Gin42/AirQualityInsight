const User = require("../models/authModel");

const registerUser = async (userData) => {
  try {
    const result = await new User(userData).save();
    return { message: "Registration successful", user: result };
  } catch (err) {
    console.error("Error registering user:", err);
    if (err.code === 11000) {
      return { error: "Username already exists" };
    }
    if (err.errInfo && err.errInfo.details) {
      console.error(
        "Validation details:",
        JSON.stringify(err.errInfo.details, null, 2)
      );
    }
    return { error: "Registration failed" };
  }
};

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
  registerUser,
  loginUser,
};
