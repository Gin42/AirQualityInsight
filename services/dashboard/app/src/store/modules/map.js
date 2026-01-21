const state = () => ({
  center: {
    lng: "11.3426000",
    lat: "44.4939000",
    name: "Piazza Maggiore",
  },
  currentCoords: {
    lng: "11.3426000",
    lat: "44.4939000",
  },
  zoom: 13,
  selectedMeasurement: "pm25",
  gridType: "none",
});

const getters = {};

const mutations = {
  setCenter(state, { currentLng, currentLat }) {
    state.center.lng = currentLng;
    state.center.lat = currentLat;
  },
  setZoom(state, zoom) {
    state.zoom = zoom;
  },
  setSelectedMeasurement(state, selectedMeasurement) {
    state.selectedMeasurement = selectedMeasurement;
  },
  setGridType(state, gridType) {
    state.gridType = gridType;
  },
  setCurrentCoords(state, currentCoords) {
    state.currentCoords = {
      lng: currentCoords.lng,
      lat: currentCoords.lat,
    };
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
