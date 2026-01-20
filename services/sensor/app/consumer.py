# consumer.py
from kafka import KafkaConsumer
import json, logging, os, threading, time
from kafka.errors import NoBrokersAvailable
from producer import send_ack

logger = logging.getLogger(__name__)

KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'kafka:9092')
CONSUMER_TOPIC = os.environ.get('CONSUMER_TOPIC', 'sensors')

INIT_SENSORS = None
INIT_RECEIVED = threading.Event()
consumer = None

on_create_sensor = None
on_delete_sensor = None

def register_create_handler(handler):
    global on_create_sensor
    on_create_sensor = handler

def register_delete_handler(handler):
    global on_delete_sensor
    on_delete_sensor = handler

def register_update_handler(handler):
    global on_update_sensor
    on_update_sensor = handler

def create_consumer(max_retries=10, delay=5):
    global consumer
    for _ in range(max_retries):
        try:
            consumer = KafkaConsumer(
                CONSUMER_TOPIC,
                bootstrap_servers=[KAFKA_BROKER],
                auto_offset_reset='earliest',
                value_deserializer=lambda v: json.loads(v.decode()),
                key_deserializer=lambda k: k.decode() if k else None,
            )
            return consumer
        except NoBrokersAvailable:
            time.sleep(delay)
    raise RuntimeError("Kafka not available")

def run_consumer():
    global INIT_SENSORS

    for message in consumer:
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
        elif message.key == "CREATE":
            if on_create_sensor:
                on_create_sensor(payload["sensor"])
            send_ack(payload["message_id"])
        elif message.key == "DELETE":
            if on_delete_sensor:
                on_delete_sensor(payload["sensor"])
            send_ack(payload["message_id"])
        elif message.key == "MODIFY":
            if on_update_sensor:
                on_update_sensor(payload["sensor"])
            send_ack(payload["message_id"])

def wait_init(timeout=60):
    return INIT_RECEIVED.wait(timeout)

def get_sensors():
    return INIT_SENSORS

def start_consumer_thread():
    threading.Thread(target=run_consumer, daemon=True).start()
