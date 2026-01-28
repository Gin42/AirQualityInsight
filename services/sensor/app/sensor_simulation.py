# sensor_simulation.py
import threading, time, logging
from consumer import (
    create_consumer,
    start_consumer_thread,
    wait_init,
    get_sensors,
    register_create_handler,
    register_delete_handler,
    register_update_handler,
    register_status_update_handler,
    register_status_all_handler
)
from producer import create_producer, send_message, close_producer
from sensor_runtime import (
    create_sensor_thread, 
    delete_sensor_thread,
    update_sensor_name,
    deactivate_sensor,
    activate_sensor,
    all_status_update)

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

def handle_update(sensor_payload):
    sensor_id = sensor_payload.get("sensor_id")
    sensor_name = sensor_payload.get("sensor_name")
    if not sensor_id:
        logger.error(f"Received UPDATE message without sensor_id: {sensor_payload}")
        return
    update_sensor_name(sensor_id, sensor_name)

def handle_status_update(sensor_payload):
    sensor_id = sensor_payload.get("sensor_id")
    sensor_active = sensor_payload.get("active")
    if not sensor_id:
        logger.error(f"Received UPDATE_STATUS message without sensor_id: {sensor_payload}")
        return
    if sensor_active == False:
        deactivate_sensor(sensor_id)
    else:
        activate_sensor(sensor_id)

def handle_all_status(selected_status):
    all_status_update(selected_status)

if __name__ == "__main__":
    try:
        create_producer()
        create_consumer()
        register_create_handler(handle_create)
        register_delete_handler(handle_delete)
        register_update_handler(handle_update)
        register_status_update_handler(handle_status_update)
        register_status_all_handler(handle_all_status)

        start_consumer_thread()

        logger.info("Waiting for INIT...")
        wait_init()

        for sensor in get_sensors():
            handle_create(sensor)

        while True:
            time.sleep(1)

    finally:
        close_producer()
