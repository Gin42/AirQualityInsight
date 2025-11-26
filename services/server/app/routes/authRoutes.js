// authRoutes.js
const express = require("express");
const authController = require("./authController");
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/checkAuthToken", authController.checkAuthToken);
router.get("/refreshAuthToken", authController.refreshAuthToken);

/** TO-DO:
 * - checkAutotizazione()
 *
 * - deleteUser (?)
 */

module.exports = router;
