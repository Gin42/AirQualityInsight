import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import { useRoute } from "vue-router";

export function createLeafletMap() {
  let map = null;
  let heatLayer = null;
  let searchLayer = null;

  function init(el, center, zoom, onReady) {
    map = L.map(el).setView([center.lat, center.lng], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    heatLayer = L.heatLayer([], {
      radius: Math.max(8, zoom * 2),
      minOpacity: 0.3,
      maxZoom: 14,
      gradient: {
        0: "#00e400",
        0.15: "#feff00",
        0.3: "#ff7e00",
        0.6: "#ff0000",
        0.75: "#8f3f97",
        1: "#7e0023",
      },
    }).addTo(map);

    map.whenReady(onReady);
    return map;
  }

  function updateHeatmap(points) {
    if (!heatLayer) return;

    if (points.length === 0) {
      heatLayer.setLatLngs([]);
      heatLayer.setOptions({
        radius: Math.max(8, map.getZoom() * 2),
      });
    } else {
      heatLayer.setLatLngs(points);
      heatLayer.setOptions({
        radius: Math.max(8, map.getZoom() * 2),
      });
    }
  }

  function setSearchLayer(data) {
    clearSearchLayer();
    searchLayer = L.geoJSON(data, {
      style: {
        color: "#3590f3",
        weight: 2,
        fillOpacity: 0.2,
      },
    }).addTo(map);

    map.flyToBounds(searchLayer.getBounds(), { duration: 1.5 });
  }

  function clearSearchLayer() {
    if (searchLayer) {
      map.removeLayer(searchLayer);
      searchLayer = null;
    }
  }

  function centerOnLocation(lat, lng, zoom = 16) {
    if (!this.map) throw "Map not initialized";

    this.map.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.5, // sec
    });
  }

  return {
    get map() {
      return map;
    },
    init,
    updateHeatmap,
    setSearchLayer,
    clearSearchLayer,
    centerOnLocation,
  };
}
