import { fetchFromApi } from "@/services/api";

const state = () => ({
  username: null,
});

const getters = {
  getUsername: (state) => state.username,
};

const mutations = {
  setAuth(state, username) {
    state.username = username;
  },
  resetAuth(state) {
    state.username = null;
  },
};

const actions = {
  async login({ commit }, userData) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const response = await fetchFromApi(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (!response.error) {
        commit("setAuth", response.username);
      }

      return response;
    } catch (error) {
      console.error("Unable to login", error);
      throw error;
    }
  },

  async logout({ commit }) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      await fetchFromApi(`${apiUrl}/api/auth/logout`, {
        credentials: "include",
      });
    } catch (error) {
      console.error("Unable to logout", error);
    } finally {
      commit("resetAuth");
    }
  },

  async checkAuth({ commit, dispatch }) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const response = await fetchFromApi(`${apiUrl}/api/auth/checkAuthToken`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response?.error) {
        if (response.logout) {
          dispatch("logout", null, { root: false });
        }
      } else {
        commit("setAuth", response.username);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      commit("resetAuth");
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
