import L from "leaflet";

export function createSensorMarkers(map, icon, onClick) {
  function add(sensor) {
    if (sensor.getMarker()) return;

    const marker = L.marker([sensor.getLat(), sensor.getLng()], { icon }).addTo(
      map,
    );

    marker.on("click", () => onClick(sensor));
    sensor.setMarker(marker);
  }

  function remove(sensor) {
    const marker = sensor.getMarker();
    if (!marker) return;
    marker.remove();
    sensor.setMarker(null);
  }

  function sync(newSensors, oldSensors) {
    const newMap = new Map(newSensors.map((s) => [s.sensor_id, s]));
    const oldMap = new Map(oldSensors.map((s) => [s.sensor_id, s]));

    for (const [id, sensor] of newMap) {
      if (!oldMap.has(id)) add(sensor);
    }

    for (const [id, sensor] of oldMap) {
      if (!newMap.has(id)) remove(sensor);
    }
  }

  return { sync };
}
