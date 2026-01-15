# sensor_simulation.py
from config import SENSOR_CONFIG
import random
import logging
import time
import threading
from air_quality_sensor import AirQualitySensor

from consumer import create_consumer, get_sensors, start_consumer_thread, wait_init
from producer import close_producer, get_producer, send_message, create_producer

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

stop_event = threading.Event()

def read_from_sensor(sensor):
    global stop_event
    """Read from a single sensor in a continuous loop"""
    logger.info(f"Starting air quality sensor simulation for sensor «{sensor.get_name()}»...")

    try:
        while not stop_event.is_set():
            reading = sensor.generate_reading()
            send_message(reading)
            # Adding random seed to mix measurement times
            time.sleep(sensor.config['sampling_rate'] * random.uniform(0, 5))
    except Exception as e:
        logger.error(f"Error in sensor «{sensor.get_name()}»: {e}")
    finally:
        logger.info(f"Sensor thread for «{sensor.get_name()}» exiting")



if __name__ == "__main__":

    try:

        create_producer(max_retries=20, delay=5)
        create_consumer(max_retries=20, delay=5)
        start_consumer_thread()

        logger.info("Waiting for INIT message...")
        if not wait_init():
            raise RuntimeError("INIT not received in time")
        logger.info("INIT payload loaded successfully")
        
        all_sensors = get_sensors()
        if not all_sensors:
            raise RuntimeError("INIT received but sensor list is empty")

        # Create and start a thread for each sensor
        threads = []

        for _sensor in all_sensors:
            sensor = AirQualitySensor(_sensor, SENSOR_CONFIG)

            # Create a thread for this sensor
            thread = threading.Thread(
                target=read_from_sensor,
                args=(sensor,),
                name=f"Sensor-{sensor.sensor['sensor_id']}"
            )
            thread.start()
            threads.append(thread)
            logger.info(f"Started thread for sensor «{sensor.get_name()}»")

        # Wait for all threads to complete (they won't unless interrupted)
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down all sensors...")
        stop_event.set()  

        for thread in threads:
            thread.join()
        logger.info("All sensor threads stopped")

    except Exception as e:
        logger.error(f"Application error: {e}")

    finally:
        close_producer()