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

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteSensor = async (req, res) => {
  console.log("HEYO");
  const { id } = req.params;
  try {
    const result = await sensorService.deleteSensorData(id);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSensor = async (req, res) => {
  const { sensorId } = req.query;
  const query = {};

  if (sensorId) query.sensor_id = sensorId;

  try {
    console.log("UGO, mi collego al database");
    await sensorService.connectWithRetry();
    console.log("FOO, ora cerco nel database");
    const sensors = await sensorService.getSensorData(query);
    console.log("BAR, ecco i sensori", sensors);
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addSensor, getSensor, deleteSensor };
