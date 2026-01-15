# sensor_runtime.py
import threading
import logging
import time
import random
from air_quality_sensor import AirQualitySensor
from config import SENSOR_CONFIG

logger = logging.getLogger(__name__)

threads = []

def read_from_sensor(sensor, stop_event, send_message):
    logger.info(f"Starting sensor «{sensor.get_name()}»")
    while not stop_event.is_set():
        reading = sensor.generate_reading()
        send_message(reading)
        # Adding random seed to mix measurement times
        time.sleep(sensor.config['sampling_rate'] * random.uniform(0, 5))

def create_sensor_thread(sensor_data, stop_event, send_message):
    sensor = AirQualitySensor(sensor_data, SENSOR_CONFIG)

    thread = threading.Thread(
        target=read_from_sensor,
        args=(sensor, stop_event, send_message),
        name=f"Sensor-{sensor_data['sensor_id']}",
        daemon=True
    )
    thread.start()

    threads.append(thread)
    logger.info(f"Started thread for sensor «{sensor.get_name()}»")
