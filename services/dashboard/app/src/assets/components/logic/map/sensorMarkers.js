import L from "leaflet";
import "leaflet.markercluster/dist/leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

export function createSensorMarkers(
  map,
  icon,
  onClick,
  getSelectedMeasurement,
  getIntensity,
  clearHeatMapOfSensor,
) {
  const radius = (zoom) => {
    if (zoom >= 15) return 30;
    if (zoom >= 10) return 50;
    return 100;
  };

  const cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: false,
    maxClusterRadius: (zoom) => radius(map.getZoom),
    animate: false,
    iconCreateFunction: function (cluster) {
      let sum = 0;
      let count = 0;

      const measurement = getSelectedMeasurement();

      cluster.getAllChildMarkers().forEach((marker) => {
        const sensor = marker.sensor;
        if (!sensor || !sensor.getActive()) return;

        const value = Number(sensor.getLatestMeasurementValue(measurement));

        if (Number.isNaN(value)) return;

        sum += value;
        count++;
      });

      const average =
        sum === 0 || count === 0 ? "NDA" : (sum / count).toFixed(1);

      let formattedLabel = "no-data";
      if (average !== "NDA") {
        const intensity = getIntensity({
          concentration: Number(average),
          pollutant: measurement,
        });

        formattedLabel = intensity.label.toLowerCase().replace(/\s+/g, "-");
      }

      return L.divIcon({
        html: `<b>${average}</b>`,
        className: `cluster-average cluster-${formattedLabel}`,
        iconSize: L.point(40, 40),
      });
    },
  });

  map.addLayer(cluster);

  function add(sensor) {
    if (sensor.getMarker()) return;

    const marker = L.marker([sensor.getLat(), sensor.getLng()], { icon });
    marker.sensor = sensor;

    marker.on("click", () => onClick(sensor));
    cluster.addLayer(marker);
    sensor.setMarker(marker);
  }

  function remove(sensor) {
    const marker = sensor.getMarker();
    if (!marker || !marker._map) return;

    cluster.removeLayer(marker);
    sensor.setMarker(null);
    clearHeatMapOfSensor(sensor);
  }

  function sync(newSensors, oldSensors) {
    const newMap = new Map(newSensors.map((s) => [s.sensor_id, s]));
    const oldMap = new Map(oldSensors.map((s) => [s.sensor_id, s]));

    const toAdd = [];
    const toRemove = [];

    for (const [id, sensor] of newMap) {
      if (!oldMap.has(id)) toAdd.push(sensor);
    }

    for (const [id, sensor] of oldMap) {
      if (!newMap.has(id)) toRemove.push(sensor);
    }

    cluster.options.animate = false;
    toRemove.forEach(remove);
    toAdd.forEach(add);
    cluster.options.animate = true;
    refresh();
  }

  function clear() {
    cluster.clearLayers();
  }

  function refresh() {
    if (!map.hasLayer(cluster)) return;
    cluster.refreshClusters();
  }

  return { sync, refresh, clear };
}
