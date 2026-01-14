const sensorService = require("./sensorService");

const addSensor = async (req, res) => {
  try {
    let count = await sensorService.countSensors();
    count = count + 1;

    const newSensor = {
      sensor_id: "",
      name: req.body.name,
      location: req.body.location,
      ip: sensorService.generateIPAddresses(count),
      active: req.body.active,
      last_seen: req.body.last_seen,
    };

    const result = await sensorService.addSensorData(newSensor);
    console.log("result");
    console.log(result);

    const change = {
      action: "added",
      sensor: result.sensor_id,
    };
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSensor = async (req, res) => {
  const { sensorId } = req.query;
  const query = {};

  if (sensorId) query.sensor_id = sensorId;

  try {
    await sensorService.connectWithRetry();
    const sensors = await sensorService.getSensorData(query);
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addSensor, getSensor };
