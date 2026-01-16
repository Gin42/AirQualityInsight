# sensor_simulation.py
import threading, time, logging
from consumer import (
    create_consumer,
    start_consumer_thread,
    wait_init,
    get_sensors,
    register_create_handler,
    register_delete_handler
)
from producer import create_producer, send_message, close_producer
from sensor_runtime import (
    create_sensor_thread, 
    delete_sensor_thread)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handle_create(sensor_payload):
    create_sensor_thread(sensor_payload, send_message)

def handle_delete(sensor_payload):
    sensor_id = sensor_payload.get("sensor_id")
    if not sensor_id:
        logger.error(f"Received DELETE message without sensor_id: {sensor_payload}")
        return
    delete_sensor_thread(sensor_id)

if __name__ == "__main__":
    try:
        create_producer()
        create_consumer()
        register_create_handler(handle_create)
        register_delete_handler(handle_delete)
        start_consumer_thread()

        logger.info("Waiting for INIT...")
        wait_init()

        for sensor in get_sensors():
            handle_create(sensor)

        while True:
            time.sleep(1)

    finally:
        close_producer()
