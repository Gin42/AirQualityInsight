const User = require("../models/authModel");

const registerUser = async (userData) => {
  try {
    const result = await new User(userData).save();
    return result;
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
    const user = User.findOne({ username: credentials.username });
    if (!user) {
      return { error: "User not found" };
    }
    const isMatch = user.comparePassword(credentials.password);
    if (!isMatch) {
      return { error: "Incorrect password" };
    }
    user.authToken = credentials.authToken;
    user.refreshToken = credentials.refreshToken;
    user.save();
    return {
      message: "Login successful",
      user: { username: user.username, authToken: user.authToken },
    };
  } catch (err) {
    console.error("Error during login:", err);
    return;
  }
};

const logoutUser = async () => {
  try {
    const user = User.findOne({ active: true });
    if (!user) {
      return { error: "User not found" };
    }
    user.active = false;
    user.save();
    return true;
  } catch (err) {
    console.error("Error during logout:", err);
    return false;
  }
};

const checkAuth = async (token) => {
  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Token is invalid or expired." });
      }
      const user = User.findOne({ token: token });
      if (!user) {
        return { message: "User not found." };
      } else if (user.active === false) {
      }
      return user;
    });
  } catch (err) {
    console.error("Error during check:", err);
    return false;
  }
};

const refreshToken = async (token) => {
  try {
    const user = User.findOne({ active: true });
    if (!user) {
      return { error: "User not found" };
    }
    user.token = token;
    user.save();
    return true;
  } catch (error) {
    console.error("Error during refresh:", err);
    return false;
  }
};

function generateAuthToken(username) {
  const jwt = require("jsonwebtoken");

  const secretKey = process.env.JWT_SECRET;

  const token = jwt.sign(
    {
      sub: username,
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

  const secretKey = process.env.JWT_SECRET;

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

function decodeToken(token) {
  const decoded = jwt.verify(token, secret);
  console.log(decoded);
  return decoded;
}

module.exports = {
  generateAuthToken,
  generateRefreshToken,
  loginUser,
  logoutUser,
  checkAuth,
  refreshToken,
};
