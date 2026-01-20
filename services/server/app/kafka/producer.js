const { Kafka } = require("kafkajs");
const { v4: uuidv4 } = require("uuid");
const { registerAckWaiter } = require("./consumer.js");
const Sensor = require("../sensors/sensorModel.js");

const kafka_broker = process.env.KAFKA_BROKER || "kafka:9092";
const sensors_topic = process.env.SENSORS_TOPIC || ""; //producer
const measurements_topic = process.env.MEASUREMENT_TOPIC || "measurements";
const ack_topic = process.env.ACK_TOPIC || "ack_topic";

const Sensors_actions = {
  INIT: "INIT",
  CREATE: "CREATE",
  DELETE: "DELETE",
  MODIFY: "MODIFY",
};

const kafka = new Kafka({
  clientId: "air-quality-server-producer",
  brokers: [kafka_broker],
});

const producer = kafka.producer();

const ensureTopics = async () => {
  const admin = kafka.admin();
  await admin.connect();

  await admin.createTopics({
    topics: [
      { topic: measurements_topic, numPartitions: 1, replicationFactor: 1 },
      { topic: sensors_topic, numPartitions: 1, replicationFactor: 1 },
      { topic: ack_topic, numPartitions: 1, replicationFactor: 1 },
    ],
    waitForLeaders: true,
  });

  await admin.disconnect();
};

const createProducer = async (retries = 10, delay = 5000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await producer.connect();
      console.log(`Kafka producer connected to ${kafka_broker} (attempt ${i})`);
      return producer;
    } catch (err) {
      console.warn(
        `Kafka connection attempt ${i} failed. Retrying in ${delay / 1000}s...`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error(`Could not connect to Kafka after ${retries} attempts`);
};

const initializeSensors = async (messageId) => {
  try {
    const sensors = await Sensor.find({});

    await producer.send({
      topic: sensors_topic,
      messages: [
        {
          key: Sensors_actions.INIT,
          value: JSON.stringify({
            message_id: messageId,
            sensors: sensors,
          }),
        },
      ],
    });

    console.log(
      `Message sent to sensor topic, id: ${messageId}, action: ${Sensors_actions.INIT}`,
    );
  } catch (err) {
    console.error("Error sending Kafka message:", err.message);
  }
};

const addSensor = async (messageId, newSensor) => {
  try {
    await producer.send({
      topic: sensors_topic,
      messages: [
        {
          key: Sensors_actions.CREATE,
          value: JSON.stringify({
            message_id: messageId,
            sensor: newSensor,
          }),
        },
      ],
    });

    console.log(
      `Message sent to sensor topic, id: ${messageId}, action: ${Sensors_actions.CREATE}`,
    );
  } catch (err) {
    console.error("Error sending Kafka message:", err.message);
  }
};

const deleteSensor = async (messageId, sensor) => {
  console.log("UGO:", sensor);
  try {
    await producer.send({
      topic: sensors_topic,
      messages: [
        {
          key: Sensors_actions.DELETE,
          value: JSON.stringify({
            message_id: messageId,
            sensor: sensor,
          }),
        },
      ],
    });

    console.log(
      `Message sent to sensor topic, id: ${messageId}, action: ${Sensors_actions.DELETE}`,
    );
  } catch (err) {
    console.error("Error sending Kafka message:", err.message);
  }
};

const updateSensor = async (messageId, updatedSensor) => {
  try {
    await producer.send({
      topic: sensors_topic,
      messages: [
        {
          key: Sensors_actions.MODIFY,
          value: JSON.stringify({
            message_id: messageId,
            sensor: updatedSensor,
          }),
        },
      ],
    });

    console.log(
      `Message sent to sensor topic, id: ${messageId}, action: ${Sensors_actions.MODIFY}`,
    );
  } catch (err) {
    console.error("Error sending Kafka message:", err.message);
  }
};

const waitForAck = (messageId, timeoutMs = 10000) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`ACK timeout for ${messageId}`));
    }, timeoutMs);

    registerAckWaiter(
      messageId,
      () => {
        clearTimeout(timeout);
        resolve();
      },
      (err) => {
        clearTimeout(timeout);
        reject(err);
      },
    );
  });
};

const retryUntilAck = async (maxRetries = 10, action, payload = null) => {
  const messageId = uuidv4();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (payload) {
        await action(messageId, payload);
      } else {
        await action(messageId);
      }
      await waitForAck(messageId);
      return;
    } catch (err) {
      console.warn(err.message);
    }
  }

  throw new Error(`Action failed after ${maxRetries} retries`);
};

module.exports = {
  ensureTopics,
  createProducer,
  initializeSensors,
  retryUntilAck,
  waitForAck,
  addSensor,
  deleteSensor,
  updateSensor,
};
