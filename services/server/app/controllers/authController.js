const authService = require("../services/authService");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const credentials = {
      username: req.body.username,
      password: req.body.password,
    };
    const result = await authService.registerUser(credentials);
    if (result.error) throw new Error(result.error);

    const authToken = authService.generateAuthToken(result.username);
    const refreshToken = authService.generateRefreshToken(result.username);

    // Set access token in HTTP-only cookie
    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 24 * 24 * 60 * 1000, // 3 days
    });

    res.json({
      message: "User registration successful",
      username: result.user.username,
    });
  } catch (error) {
    console.error("Registration error:", error); // Log the error for server-side tracking
    res.status(400).json({ error: error.message }); // Use status codes
  }
};

const login = async (req, res) => {
  try {
    const credentials = {
      username: req.body.username,
      password: req.body.password,
    };
    console.log("UGO");
    console.log(credentials);
    const result = await authService.loginUser(credentials);

    if (result.error) throw new Error(result.error);

    const authToken = authService.generateAuthToken(result.username);
    const refreshToken = authService.generateRefreshToken(result.username);

    // Set access token in HTTP-only cookie
    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 24 * 24 * 60 * 1000, // 3 days
    });

    res.json({ message: "User login succesful", username: result });
  } catch {
    res.json({ error: error.message });
  }
};

const logout = (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({ message: "Successfully logged out" });
};

const checkAuthToken = async (req, res) => {
  const authToken = req.cookies.authToken;

  if (!authToken) {
    return res.status(401).json({ error: "No auth token provided" });
  }

  try {
    const authDecoded = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECREt);
    // il token è ancora valido
    return authDecoded;
  } catch (error) {
    //il token non è valido
    if (error.name === "TokenExpiredError") {
      return refreshAuthToken(req, res);
    }

    return res.status(401).json({ error: "Invalid auth token" });
  }
};

const refreshAuthToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const decodedRefresh = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const newAccessToken = authService.generateAuthToken(decoded.name);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Access token refreshed" });
  } catch (err) {
    logout(req, res);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

module.exports = {
  register,
  login,
  logout,
  checkAuthToken,
  refreshAuthToken,
};
