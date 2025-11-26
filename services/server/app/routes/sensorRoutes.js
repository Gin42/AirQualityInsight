// sensorRoutes.js
const express = require("express");
const sensorController = require("../controllers/sensorController");
const router = express.Router();

router.get("/", sensorController.allSensors);
router.post("/addSensor", sensorController.addSensor);

/** TO-DO:
 * - deleteSensor
 * - modifySensor
 *
 * - getSensor (id) ???
 */

module.exports = router;
