export function createHeatMap() {
  function buildHeatmapPoints({
    data,
    sensor,
    measurementTypes,
    selectedMeasurement,
    getIntensity,
  }) {
    for (const type of Object.keys(measurementTypes)) {
      const intensity = getIntensity({
        concentration: data[type],
        pollutant: type,
      });

      measurementTypes[type].heatLatLng.set(sensor.sensor_id, [
        sensor.lat,
        sensor.lng,
        intensity.value,
      ]);
    }

    return Array.from(
      measurementTypes[selectedMeasurement].heatLatLng.values(),
    );
  }

  function changeHeatmapPoints({ measurementTypes, selectedMeasurement }) {
    return Array.from(
      measurementTypes[selectedMeasurement].heatLatLng.values(),
    );
  }

  function clearHeatMapOfSensor({ sensor, measurementTypes }) {
    if (!sensor?.sensor_id) return;

    for (const type of Object.keys(measurementTypes)) {
      measurementTypes[type].heatLatLng.delete(sensor.sensor_id);
    }
  }

  return { buildHeatmapPoints, changeHeatmapPoints, clearHeatMapOfSensor };
}
