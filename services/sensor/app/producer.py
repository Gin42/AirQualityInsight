""" 
producer.py
It's role is to send info about the measurements to the server
and to send ACK when it receive info from the server
"""
from kafka import  KafkaProducer
from kafka.errors import NoBrokersAvailable
import json
import logging
import os
import time
import threading
import socket


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Kafka configuration
KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'kafka:9092')
PRODUCER_TOPIC = os.environ.get('MEASUREMENT_TOPIC', 'measurements')
ACK_TOPIC = os.environ.get('ACK_TOPIC', 'ack_topic')

producer = None

def create_producer(max_retries = 10, delay = 5): 
    global producer
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


def send_message(message):
    """Send a message to a Kafka topic"""
    global producer
    if not producer:
        raise RuntimeError("Producer not initialized")

    try:
        producer.send(PRODUCER_TOPIC, value=message)
        logger.info(f"Queued message from sensor '{message.get('name', 'unknown')}'")
    except Exception as e:
        logger.error(f"Failed to queue message from {message.get('name', 'unknown')}: {e}")


def send_ack(message_id):
    global producer
    if not producer:
        raise RuntimeError("Producer not initialized")

    ack= {
        "message_id": message_id,
    }
    future = producer.send(
        ACK_TOPIC,
        key=b"MESSAGE_ACK",
        value=ack
    )

    try:
        # Block until the message is sent (or timeout)
        record_metadata = future.get(timeout=10)
        logger.info(
            f"ACK sent for {ack['message_id']}, "
            f"to: {record_metadata.topic} "
            f"partition: {record_metadata.partition} "
            f"offset: {record_metadata.offset}"
        )

    except Exception as e:
        logger.error(f"Failed to send ACK")

def get_producer():
    return producer

def close_producer():
    global producer
    if producer:
        producer.flush()
        producer.close()
        logger.info("Producer closed")

