# sensor_runtime.py
import threading
import logging
import time
import random
from air_quality_sensor import AirQualitySensor
from config import SENSOR_CONFIG

logger = logging.getLogger(__name__)

threads = {}

GLOBAL_ACTIVE_STATUS = True

def read_from_sensor(sensor, stop_event, active_event, send_message):
    logger.info(f"Starting sensor «{sensor.get_name()}»")
    while not stop_event.is_set():
        # Wait until sensor is active
        active_event.wait()

        if stop_event.is_set():
            break

        reading = sensor.generate_reading()
        send_message(reading)

        time.sleep(sensor.config['sampling_rate'] * random.uniform(0, 5))

def create_sensor_thread(sensor_data, send_message):
    sensor_id = sensor_data["sensor_id"]
    stop_event = threading.Event()
    active_event = threading.Event()
    if GLOBAL_ACTIVE_STATUS:
        active_event.set()
    else:
        active_event.clear()

    sensor = AirQualitySensor(sensor_data, SENSOR_CONFIG)

    thread = threading.Thread(
        target=read_from_sensor,
        args=(sensor, stop_event, active_event, send_message),
        name=f"Sensor-{sensor_id}",
        daemon=True,
    )
    thread.start()

    threads[sensor_id] = {
        "thread": thread,
        "stop_event": stop_event,
        "active_event": active_event,
        "sensor": sensor,
    }

    logger.info(f"Started thread for sensor «{sensor.get_name()}»")



def delete_sensor_thread(sensor_id):
    entry = threads.get(sensor_id)

    if not entry:
        logger.warning(f"No thread found for sensor {sensor_id}")
        return

    logger.info(f"Stopping sensor thread «{sensor_id}»")

    entry["stop_event"].set()
    entry["thread"].join(timeout=5)

    del threads[sensor_id]

    logger.info(f"Sensor thread «{sensor_id}» stopped and removed")

def update_sensor_name(sensor_id, new_name):
    entry = threads.get(sensor_id)

    if not entry:
        logger.warning(f"No thread found for sensor {sensor_id}")
        return

    logger.info(f"Updating name for sensor {sensor_id} to «{new_name}»")
    entry["sensor"].set_name(new_name)

def deactivate_sensor(sensor_id): 
    entry =  threads.get(sensor_id)
    if not entry:
        logger.warning(f"No thread found for sensor {sensor_id}")
        return
    
    logger.info(f"Deactivating sensor «{sensor_id}»")
    entry["active_event"].clear()

def activate_sensor(sensor_id): 
    entry =  threads.get(sensor_id)
    if not entry:
        logger.warning(f"No thread found for sensor {sensor_id}")
        return
    
    logger.info(f"Activating sensor «{sensor_id}»")
    entry["active_event"].set()

def all_status_update(selected_status):
    global GLOBAL_ACTIVE_STATUS
    GLOBAL_ACTIVE_STATUS = selected_status

    action = "Activating" if selected_status else "Deactivating"
    logger.info(f"{action} ALL sensors")

    for sensor_id, entry in threads.items():
        if "active_event" not in entry:
            logger.warning(f"Sensor {sensor_id} has no active_event")
            continue

        if selected_status:
            entry["active_event"].set()
        else:
            entry["active_event"].clear()