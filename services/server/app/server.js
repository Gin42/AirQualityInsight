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

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

const io = socketIo(server, { cors: { origin: corsOrigin } });

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
    status: "healthy",
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

// WebSocket connections handler
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.emit("wot-directory", Array.from(registeredSensors.values()));

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

async function startServer() {
  try {
    await connectWithRetry();
    await initializeWoTGateway(io, port);
    await ensureTopics();
    await createProducer();
    await runAckConsumer();
    await retryUntilAck(10, initializeSensors);
    await runConsumer(io);

    server.listen(port, () =>
      console.log(`Server running on http://localhost:${port}`)
    );
  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
}

startServer();
