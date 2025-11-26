const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const data = {
      username: req.username,
      password: req.password,
      authToken: generateAuthToken(username),
      refreshToken: authService.generateRefreshToken(username),
    };
    const result = await authService.registerUser(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const data = {
    username: req.username,
    password: req.password,
    authToken: generateAuthToken(username),
    refreshToken: authService.generateRefreshToken(username),
  };
  const result = await authService.loginUser(data);
  if (!result) throw new Error(result || "Couldn't login user");
  res.json(result);
};

const logout = async (req, res) => {
  const result = await authService.logoutUser();
  if (!result) throw new Error(result || "Couldn't logout user");
  res.json(result);
};

const checkAuthToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }
  try {
    const result = await checkAuth(token);
    res.send(result);
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({
      message: error.message || "An error occurred while checking auth.",
    });
  }
};

const refreshAuthToken = async (req, res) => {
  const result = await refreshToken(token);
  if (!result) throw new Error(result || "Couldn't refresh token");
  res.send(token);
};

module.exports = {
  register,
  login,
  logout,
  checkAuthToken,
  refreshAuthToken,
};
