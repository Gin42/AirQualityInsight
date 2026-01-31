const sensorService = require("./sensorService");

const addSensor = async (req, res) => {
  console.log("\nADDING A NEW SENSOR\n");
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
  const { id } = req.params;
  try {
    const result = await sensorService.deleteSensorData(id);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const modifySensor = async (req, res) => {
  console.log("HE-MAN");
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name query parameter is required" });
  }

  try {
    const result = await sensorService.modifySensorData(id, name);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  if (active == null) {
    return res
      .status(400)
      .json({ error: "Active query parameter is required" });
  }

  try {
    const result = await sensorService.updateSensorStatus(id, active);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const setAllStatus = async (req, res) => {
  console.log("UGO");
  const selectedStatus = req.body.selectedStatus;
  try {
    const result = await sensorService.updateAllSensorsStatus(selectedStatus);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSensor = async (req, res) => {
  const { query } = req.query;

  let parsedQuery = {};
  if (query) {
    try {
      parsedQuery = JSON.parse(query);
    } catch (err) {
      return res.status(400).json({ error: "Invalid query JSON" });
    }
  }

  console.log();

  try {
    await sensorService.connectWithRetry();
    const sensors = await sensorService.getSensorData(parsedQuery);
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addSensor,
  getSensor,
  deleteSensor,
  modifySensor,
  updateStatus,
  setAllStatus,
};
