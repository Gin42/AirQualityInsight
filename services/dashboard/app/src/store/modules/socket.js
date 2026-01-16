const state = () => ({
  connected: false,
  serverReady: false,
});

const mutations = {
  setConnected(state, value) {
    state.connected = value;
  },
  setServerReady(state, value) {
    state.serverReady = value;
  },
};

const getters = {
  isSocketConnected: (state) => state.connected,
  isServerReady: (state) => state.serverReady,
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
};
