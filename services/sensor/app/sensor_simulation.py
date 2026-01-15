# sensor_simulation.py
import threading, time, logging
from consumer import (
    create_consumer,
    start_consumer_thread,
    wait_init,
    get_sensors,
    register_create_handler,
)
from producer import create_producer, send_message, close_producer
from sensor_runtime import create_sensor_thread

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

stop_event = threading.Event()

def handle_create(sensor_data):
    create_sensor_thread(sensor_data, stop_event, send_message)

if __name__ == "__main__":
    try:
        create_producer()
        create_consumer()
        register_create_handler(handle_create)
        start_consumer_thread()

        logger.info("Waiting for INIT...")
        wait_init()

        for sensor in get_sensors():
            handle_create(sensor)

        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        stop_event.set()
    finally:
        close_producer()
