export function buildHeatmapPoints({
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

  return Array.from(measurementTypes[selectedMeasurement].heatLatLng.values());
}
