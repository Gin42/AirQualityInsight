// sensorRoutes.js
const express = require("express");
const sensorController = require("./sensorController");
const router = express.Router();

router.get("/", sensorController.getSensor);
router.post("/addSensor", sensorController.addSensor);
router.delete("/:id", sensorController.deleteSensor);

/** TO-DO:
 * - deleteSensor
 * - modifySensor
 *
 * - getSensor (id) ???
 */

module.exports = router;
