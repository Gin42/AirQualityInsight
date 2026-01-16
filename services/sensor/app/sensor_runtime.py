# sensor_runtime.py
import threading
import logging
import time
import random
from air_quality_sensor import AirQualitySensor
from config import SENSOR_CONFIG

logger = logging.getLogger(__name__)

threads = {}

def read_from_sensor(sensor, stop_event, send_message):
    logger.info(f"Starting sensor «{sensor.get_name()}»")
    while not stop_event.is_set():
        reading = sensor.generate_reading()
        send_message(reading)
        # Adding random seed to mix measurement times
        time.sleep(sensor.config['sampling_rate'] * random.uniform(0, 5))

def create_sensor_thread(sensor_data, send_message):
    sensor_id = sensor_data["sensor_id"]
    stop_event = threading.Event()

    sensor = AirQualitySensor(sensor_data, SENSOR_CONFIG)

    thread = threading.Thread(
        target=read_from_sensor,
        args=(sensor, stop_event, send_message),
        name=f"Sensor-{sensor_id}",
        daemon=True,
    )
    thread.start()

    threads[sensor_id] = {
        "thread": thread,
        "stop_event": stop_event,
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
