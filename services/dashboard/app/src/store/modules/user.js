import { fetchFromApi } from "@/services/api";

const state = () => ({
  username: null,
});

const mutations = {
  setAuth(state, username) {
    state.username = username;
  },
  resetAuth(state) {
    state.username = null;
  },
};

const actions = {
  async register({ commit }, userData) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const response = await fetchFromApi(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      commit("setAuth", response.username);
      return response;
    } catch (error) {
      console.error("Unable to login", error);
    }
  },

  async login({ commit }, userData) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const response = await fetchFromApi(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      commit("setAuth", response.username);
      return response;
    } catch (error) {
      console.error("Unable to login", error);
    }
  },

  async logout({ commit }) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const response = await fetchFromApi(`${apiUrl}/api/auth/logout`, {
        credentials: "include",
      });
      if (response) {
        commit("resetAuth");
      } else {
        console.error("Unable to logout");
      }
    } catch (error) {
      console.error("Unable to logout", error);
    }
  },

  async checkAuth({ state, dispatch }) {
    try {
      const response = await fetchFromApi(`${apiUrl}/api/auth/checkAuthToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response === null) {
        dispatch("logout");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      dispatch("resetAuth");
    }
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
