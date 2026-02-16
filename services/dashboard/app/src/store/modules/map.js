const state = () => ({
  center: {
    lat: "44.14771",
    lng: "12.2356576",
    name: "Via dell'Università 50, 47522 Cesena FC, Italia",
  },
  currentCoords: {
    lat: "44.14771",
    lng: "12.2356576",
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
