const authService = require("./authService");
const User = require("./authModel");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const credentials = {
      username: req.body.username,
      password: req.body.password,
    };

    const result = await authService.loginUser(credentials);

    if (result.error) throw new Error(result.error);

    const authToken = authService.generateAuthToken(result.username);
    const refreshToken = authService.generateRefreshToken(result.username);

    // Set access token in HTTP-only cookie
    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Login successful", username: result.username });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const logout = (req, res) => {
  res.cookie("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // Optional, set for long expiration
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // Optional, set for long expiration
  });

  return res.status(200).json({ message: "Successfully logged out" });
};

const checkAuthToken = async (req, res) => {
  const allUsers = await User.find();
  const authToken = req.cookies.authToken;

  if (!authToken || authToken === null) {
    return res.json({ error: "No auth token provided" });
  }

  try {
    const authDecoded = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET);
    // il token è ancora valido
    return res.json({ username: authDecoded.name });
  } catch (error) {
    //il token non è valido
    if (error.name === "TokenExpiredError") {
      return refreshAuthToken(req, res);
    }

    return res.json({ error: "Invalid auth token" });
  }
};

const refreshAuthToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.json({ error: "No refresh token provided" });
  }

  try {
    const decodedRefresh = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const newAuthToken = authService.generateAuthToken(decodedRefresh.name);

    res.cookie("authToken", newAuthToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      username: decodedRefresh.name,
      message: "Access token refreshed",
    });
  } catch (err) {
    logout(req, res);
    return res.json({
      error: "Invalid or expired refresh token",
      logout: true,
    });
  }
};

const initializeAccount = async (req, res) => {
  try {
    await authService.connectWithRetry();
    const userData = await authService.getAccount();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  login,
  logout,
  checkAuthToken,
  refreshAuthToken,
  initializeAccount,
};
