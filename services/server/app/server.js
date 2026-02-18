// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");

const { connectWithRetry, Measurement } = require("./database");
const {
  ensureTopics,
  createProducer,
  initializeSensors,
  retryUntilAck,
} = require("./kafka/producer");
const { runConsumer, runAckConsumer } = require("./kafka/consumer");

const {
  initializeWoTGateway,
  registeredSensors,
  latestMeasurements,
} = require("./wot/wotGateway");

const wotRoutes = require("./wot/wotRoutes");
const authRoutes = require("./user/authRoutes");
const sensorRoutes = require("./sensors/sensorRoutes");
const { getSensor } = require("./sensors/sensorController");
const { getSensorData } = require("./sensors/sensorService");

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

const io = socketIo(server, { cors: { origin: corsOrigin } });

let serverReady = false;

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/wot", wotRoutes);

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Next middleware
});

// Health
app.get("/health", (req, res) => {
  res.json({
    status: serverReady,
    uptime: process.uptime(),
    wot_things: registeredSensors.size,
    active_measurements: latestMeasurements.size,
  });
});

app.get("/api/measurements", async (req, res) => {
  try {
    const { startDate, endDate, sensorId } = req.query;
    const query = {};

    if (sensorId) query.sensor_id = sensorId;

    if (startDate && endDate)
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };

    const measurements = await Measurement.find(query)
      .sort({ timestamp: 1 })
      .limit(1000);

    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/latest", async (req, res) => {
  try {
    connectWithRetry();
    const latest = await Measurement.findOne().sort({ timestamp: -1 });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/search", async (req, res) => {
  const { q } = req.query;

  const query = new URLSearchParams({
    q,
    polygon_geojson: 1,
    format: "json",
  }).toString();

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${query}`,
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// WebSocket connections handler
io.on("connection", (socket) => {
  if (serverReady) {
    socket.emit("server:ready");
  } else {
    socket.emit("server:not-ready");
  }

  console.log("New client connected");

  socket.emit("wot-directory", Array.from(registeredSensors.values()));

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start listening immediately
server.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);

// Then do initialization in the background
async function init() {
  try {
    await connectWithRetry();
    await initializeWoTGateway(io, port);
    await ensureTopics();
    await createProducer();
    await runAckConsumer();
    await retryUntilAck(10, initializeSensors);
    await runConsumer(io);

    serverReady = true;
    io.emit("server:ready");

    console.log("Server fully initialized and ready");
  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
}

init();
