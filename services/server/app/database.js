const DEBUG = false;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const sensorSchema = new mongoose.Schema({
  sensor_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  ip: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  last_seen: {
    type: Date,
    default: Date.now,
  },
});
sensorSchema.index({ location: "2dsphere" });

const Sensor = mongoose.model("Sensor", sensorSchema);

const measurementSchema = new mongoose.Schema({
  sensor_id: String,
  timestamp: Date,
  temperature: Number,
  humidity: Number,
  pressure: Number,
  voc: Number,
  co2: Number,
  pm25: Number,
  pm10: Number,
  no2: Number,
  o3: Number,
  so2: Number,
});
const Measurement = mongoose.model("Measurement", measurementSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

const connectWithRetry = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://mongodb:27017/sensordata";

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000, // Give up initial connection after 10s
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

const createSensor = async (sensorData) => {
  try {
    sensorData.sensor_id = new mongoose.Types.ObjectId();
    const result = await new Sensor(sensorData).save();
    return result;
  } catch (err) {
    console.error("Error saving sensor:", err);
    if (err.errInfo && err.errInfo.details) {
      console.error(
        "Validation details:",
        JSON.stringify(err.errInfo.details, null, 2)
      );
    }
    return;
  }
};

const saveMeasurement = async (measurement) => {
  const processedMeasurement = {
    ...measurement,
    timestamp: new Date(measurement.timestamp),
    temperature: parseFloat(measurement.temperature),
    humidity: parseFloat(measurement.humidity),
    pressure: parseFloat(measurement.pressure),
    voc: parseFloat(measurement.voc),
    co2: parseFloat(measurement.co2),
    pm25: parseFloat(measurement.pm25),
    pm10: parseFloat(measurement.pm10),
    no2: parseFloat(measurement.no2),
    o3: parseFloat(measurement.o3),
    so2: parseFloat(measurement.so2),
  };

  if (DEBUG) console.log("Processed Measurement:", processedMeasurement);

  try {
    const result = await new Measurement(processedMeasurement).save();
    if (DEBUG) console.log("Measurement saved successfully:", result);
  } catch (err) {
    console.error("Error saving measurement:", err);
    if (err.errInfo && err.errInfo.details) {
      console.error(
        "Validation details:",
        JSON.stringify(err.errInfo.details, null, 2)
      );
    }
  }
};

/**
 * User operations
 */

/**
 * Registering a user means creating a new User that has the following proprieties:
 * - username (unique);
 * - password (encripted);
 * - authToken (JWT token with small duration)
 * - refreshToken (JWT token to keep user session alive)
 *
 * Tipi di errore: username duplicato, password ha meno di 8 caratteri (da gestire anche frontend)
 */
const registerUser = async (userData) => {
  try {
    const result = await new User(userData).save();
    return result;
  } catch (err) {
    console.error("Error registering user:", err);
    if (err.code === 11000) {
      return { error: "Username already exists" };
    }
    if (err.errInfo && err.errInfo.details) {
      console.error(
        "Validation details:",
        JSON.stringify(err.errInfo.details, null, 2)
      );
    }
    return { error: "Registration failed" };
  }
};

/**
 * Logging a user means retrieving User using its username and password
 * Tipi di errore: username non esistente, password incorretta
 */
const loginUser = async (credentials) => {
  try {
    const user = User.findOne({ username: credentials.username });
    if (!user) {
      return { error: "User not found" };
    }
    const isMatch = user.comparePassword(credentials.password);
    if (!isMatch) {
      return { error: "Incorrect password" };
    }
    user.authToken = credentials.authToken;
    user.refreshToken = credentials.refreshToken;
    user.save();
    return {
      message: "Login successful",
      user: { username: user.username, authToken: user.authToken },
    };
  } catch (err) {
    console.error("Error during login:", err);
    return;
  }
};

const logoutUser = async () => {
  try {
    const user = User.findOne({ active: true });
    if (!user) {
      return { error: "User not found" };
    }
    user.active = false;
    user.save();
    return true;
  } catch (err) {
    console.error("Error during logout:", err);
    return false;
  }
};

const checkAuth = async (token) => {
  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Token is invalid or expired." });
      }
      const user = User.findOne({ token: token });
      if (!user) {
        return { message: "User not found." };
      } else if (user.active === false) {
      }
      return user;
    });
  } catch (err) {
    console.error("Error during check:", err);
    return false;
  }
};

const refreshToken = async (token) => {
  try {
    const user = User.findOne({ active: true });
    if (!user) {
      return { error: "User not found" };
    }
    user.token = token;
    user.save();
    return true;
  } catch (error) {
    console.error("Error during refresh:", err);
    return false;
  }
};

const generateRefreshToken = (username) => {
  const jwt = require("jsonwebtoken");

  const secretKey = process.env.JWT_SECRET;

  const token = jwt.sign(
    {
      sub: username,
      name: username,
      role: "admin",
    },
    secretKey,
    { expiresIn: "3d" }
  );

  console.log("Generated Token:", token);
  return token;
};

const decodeToken = (token) => {
  const decoded = jwt.verify(token, secret);
  console.log(decoded);
  return decoded;
};

module.exports = {
  Sensor,
  Measurement,
  User,
  connectWithRetry,
  saveMeasurement,
  createSensor,
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
};
