# sensor_simulation.py
from config import SENSOR_CONFIG
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from pymongo import MongoClient
import random
import json
import logging
import os
import sys
import time
import threading
from air_quality_sensor import AirQualitySensor
import uuid
import socket
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Kafka configuration
KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'kafka:9092')
PRODUCER_TOPIC = os.environ.get('MEASUREMENT_TOPIC', 'measurements')
CONSUMER_TOPIC = os.environ.get('CONSUMER_TOPIC', 'sensors')
ACK_TOPIC = os.environ.get('ACK_TOPIC', 'ack')


#Initialization
INIT_SENSORS = None
INIT_RECEIVED = threading.Event()

# MongoDB configuration
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://mongodb:27017/')
DB_NAME = os.environ.get('DB_NAME', 'sensordata')
COLLECTION_NAME = os.environ.get('COLLECTION_NAME', 'sensors')

# TODO if I manage to send the measurements, he will also need a Consumer for being a subscriber
def create_producer(max_retries = 10, delay = 5): 
    """Creates and returns a Kafka producer"""
    for attempt in range(1, max_retries + 1):
        try:
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_BROKER],
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                acks='all',
                retries=5,
                retry_backoff_ms=1000,
                request_timeout_ms=30000
            )
            logger.info(f"Kafka producer connected to {KAFKA_BROKER} on attempt {attempt}")
            return producer
        except NoBrokersAvailable:
            logger.warning(f"Kafka not available (attempt {attempt}/{max_retries}). Retrying in {delay}s...")
            time.sleep(delay)
    logger.error(f"Could not connect to Kafka after {max_retries} attempts")
    raise RuntimeError("Kafka broker not available")

def run_consumer(max_retries=30, delay=2):
    global INIT_SENSORS

    for attempt in range(1, max_retries + 1):
        try:
            consumer = KafkaConsumer(
                CONSUMER_TOPIC,
                bootstrap_servers=[KAFKA_BROKER],
                group_id=f"sensors-group-{uuid.uuid4()}",
                auto_offset_reset='earliest',
                enable_auto_commit=True,
                value_deserializer=lambda v: json.loads(v.decode('utf-8')),
                key_deserializer=lambda k: k.decode("utf-8") if k else None,
            )


            logger.info("Consumer connected and waiting for messages...")
            break
        except NoBrokersAvailable:
            logger.warning(
                f"Kafka not ready(attempt {attempt}/{max_retries}), retrying in {delay}s..."
            )
            time.sleep(delay)
    else:
        raise RuntimeError("Kafka consumer could not connet")

    try:
        for message in consumer:
            logger.info(
                f"Received message | topic={message.topic} "
                f"partition={message.partition} offset={message.offset}"
            )
            logger.info(f"Key: {message.key}")
            logger.info(f"Payload: {message.value}")

            if message.key == "INIT":
                payload = message.value

                if isinstance(payload, dict) and "sensors" in payload:
                    INIT_SENSORS = payload["sensors"]
                    init_id = payload.get("init_id")

                elif isinstance(payload, list):
                    INIT_SENSORS = payload
                    init_id = None

                else:
                    logger.error(f"Unknown INIT payload format: {payload}")
                    continue

                INIT_RECEIVED.set()

                if init_id:
                    producer = create_producer()
                    send_ack(producer, init_id)

    except Exception as e:
        logger.error(f"Consumer error: {e}")
    finally:
        consumer.close()

def start_consumer_thread():
    thread = threading.Thread(target=run_consumer, daemon=True)
    thread.start()

def send_ack(producer, init_id):
    ack= {
        "init_id": init_id,
        "sensor_instance": socket.gethostname(),
    }
    producer.send(
        ACK_TOPIC,
        key=b"INIT_ACK",
        value=ack
    )
    
    producer.flush()
    logger.info(f"INIT_ACK sent for init_id={init_id}")

def send_message(producer, message):
    """Send a message to a Kafka topic"""

    future = producer.send(PRODUCER_TOPIC, value=message)

    try:
        # Block until the message is sent (or timeout)
        record_metadata = future.get(timeout=10)
        logger.info(f"Message sent from {message['name']} to {record_metadata.topic} partition {record_metadata.partition} offset {record_metadata.offset}")
    except Exception as e:
        logger.error(f"Failed to send message from {message.get('name', 'unknown')}: {e}")

def read_from_sensor(sensor, producer):
    """Read from a single sensor in a continuous loop"""
    logger.info(f"Starting air quality sensor simulation for sensor «{sensor.get_name()}»...")

    try:
        while True:
            reading = sensor.generate_reading()
            send_message(producer, reading)
            # Adding random seed to mix measurement times
            time.sleep(sensor.config['sampling_rate'] * random.uniform(0, 5))
    except KeyboardInterrupt:
        logger.info(f"Stopping sensor simulation for «{sensor.get_name()}»...")
    except Exception as e:
        logger.error(f"Error in sensor «{sensor.get_name()}»: {e}")



if __name__ == "__main__":

    producer = None 

    try:

        start_consumer_thread()

        logger.info("Waiting for INIT message...")
        INIT_RECEIVED.wait(timeout=30)

        # Get sensor list from server
        while not INIT_RECEIVED.is_set():
            INIT_RECEIVED.wait(timeout=10)

        logger.info("INIT payload loaded successfully")
        
        # Create a Kafka producer
        producer = create_producer(max_retries=20, delay=5)

        all_sensors = INIT_SENSORS

        # Create and start a thread for each sensor
        threads = []

        for _sensor in all_sensors:
            sensor = AirQualitySensor(_sensor, SENSOR_CONFIG)

            # Create a thread for this sensor
            thread = threading.Thread(
                target=read_from_sensor,
                args=(sensor, producer),
                name=f"Sensor-{sensor.sensor['sensor_id']}"
            )
            thread.daemon = True  # Thread will close when main program closes
            thread.start()
            threads.append(thread)

            logger.info(f"Started thread for sensor «{sensor.get_name()}»")

        # Wait for all threads to complete (they won't unless interrupted)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Shutting down all sensors...")

    except Exception as e:
        logger.error(f"Application error: {e}")
    finally:
        if producer:
            producer.flush()
            producer.close()
            logger.info("Producer closed")