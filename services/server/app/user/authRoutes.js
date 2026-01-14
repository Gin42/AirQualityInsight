// authRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/checkAuthToken", authController.checkAuthToken);

module.exports = router;
