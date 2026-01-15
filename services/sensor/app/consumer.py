""" 
consumer.py
It's role is to get info from the server about the sensors
and to order an ACK message when done
"""
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
import json
import logging
import os
import time
import threading
import uuid

from producer import send_ack

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Kafka configuration
KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'kafka:9092')
CONSUMER_TOPIC = os.environ.get('CONSUMER_TOPIC', 'sensors')

#Initialization
INIT_SENSORS = None
INIT_RECEIVED = threading.Event()

consumer = None

def create_consumer(max_retries=10, delay=5):
    global consumer
    for attempt in range(1, max_retries + 1):
        try:
            consumer = KafkaConsumer(
                CONSUMER_TOPIC,
                bootstrap_servers=[KAFKA_BROKER],
                group_id="sensor-init-consumer",
                auto_offset_reset='earliest',
                enable_auto_commit=True,
                value_deserializer=lambda v: json.loads(v.decode('utf-8')),
                key_deserializer=lambda k: k.decode("utf-8") if k else None,
            )
            logger.info(f"Consumer connected to {KAFKA_BROKER} on attempt {attempt}")
            return consumer
        except NoBrokersAvailable:
            logger.warning(f"Kafka not ready (attempt {attempt}/{max_retries}), retrying in {delay}s...")
            time.sleep(delay)

    logger.error(f"Could not connect to Kafka after {max_retries} attempts")
    raise RuntimeError("Kafka broker not available")



def run_consumer():
    global INIT_SENSORS
    global consumer

    if consumer:
        try:
            for message in consumer:
                logger.info(
                    f"Received message | topic={message.topic} "
                    f"partition={message.partition} offset={message.offset}"
                )
                logger.info(f"Key: {message.key}")
                logger.info(f"Payload: {message.value}")

                payload = message.value

                if message.key == "INIT":

                    if isinstance(payload, dict) and "sensors" in payload:
                        INIT_SENSORS = payload["sensors"]
                        message_id = payload.get("message_id")

                    elif isinstance(payload, list):
                        INIT_SENSORS = payload
                        message_id = None

                    else:
                        logger.error(f"Unknown INIT payload format: {payload}")
                        continue

                    INIT_RECEIVED.set()

                    if message_id:
                        send_ack(message_id)

        except Exception as e:
            logger.error(f"Consumer error: {e}")
        finally:
            consumer.close()

def get_sensors():
    return INIT_SENSORS

def wait_init(timeout=60):
    received = INIT_RECEIVED.wait(timeout=timeout)
    return received

def start_consumer_thread():
    thread = threading.Thread(target=run_consumer, daemon=True)
    thread.start()
