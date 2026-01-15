const { saveMeasurement } = require("../database.js");
const { Kafka } = require("kafkajs");

const kafka_broker = process.env.KAFKA_BROKER || "kafka:9092";
const measurements_topic = process.env.MEASUREMENT_TOPIC || "measurements";
const ack_topic = process.env.ACK_TOPIC || "ack_topic";

const kafka = new Kafka({
  clientId: "air-quality-server-consumer", // deve essere unico? kafka_general?
  brokers: [kafka_broker],
});

const consumer = kafka.consumer({
  groupId: "measurements-consumer-group",
  sessionTimeout: 45000,
  heartbeatInterval: 15000,
});

const ackConsumer = kafka.consumer({
  groupId: "ack-consumer-group",
});
const ackWaiters = new Map();

let registeredSensors = new Map();
let latestMeasurements = new Map();

//Consumer for measurements
const runConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({
      topic: measurements_topic,
      fromBeginning: true, //cambiato da false, to check
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          if (topic === measurements_topic) {
            const measurement = JSON.parse(message.value.toString());
            console.log("Received message:", measurement);
            await saveMeasurement(measurement);

            latestMeasurements.set(measurement.sensor_id, measurement);

            const thing = registeredSensors.get(measurement.sensor_id);
            if (thing) {
              thing.lastContact = new Date();
              thing.status = "active";
            }

            console.log("kafka-message", measurement); //io.emit deleted, to check
          } else {
            console.log(`Ignoring message from topic: ${topic}`);
          }
        } catch (error) {
          console.error(`Error during message elaboration: ${error.message}`);
        }
      },
    });
  } catch (error) {
    console.error(`Error on Kafka consumer: ${error.message}`);
  }
};

const registerAckWaiter = (messageId, resolve, reject) => {
  ackWaiters.set(messageId, { resolve, reject });
};

const resolveAck = (messageId) => {
  const waiter = ackWaiters.get(messageId);
  if (waiter) {
    waiter.resolve();
    ackWaiters.delete(messageId);
  }
};

//Consumer for ACKs
const runAckConsumer = async () => {
  await ackConsumer.connect();
  await ackConsumer.subscribe({
    topic: ack_topic,
    fromBeginning: true,
  });

  await ackConsumer.run({
    eachMessage: async ({ topic, message }) => {
      if (topic === ack_topic) {
        const key = message.key?.toString();
        const ack = JSON.parse(message.value.toString());
        if (key == "MESSAGE_ACK") {
          resolveAck(ack.message_id);
          console.log("ACK received for message:", ack.message_id);
        }
      } else {
        console.log(`Ignoring message from topic: ${topic}`);
      }
    },
  });
};

module.exports = {
  runConsumer,
  runAckConsumer,
  registerAckWaiter,
  resolveAck,
};
