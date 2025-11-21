import { fetchFromApi } from "@/services/api";

const state = () => ({
  user: null,
  token: localStorage.getItem("authToken") || null,
});

const mutations = {
  setAuth(state, authData) {
    state.user = {
      username: authData.username,
      password: authData.password,
      id: authData._id,
    };
    state.token = authData.token;
    localStorage.setItem("authToken", authData.token);
  },
  resetAuth(state) {
    state.user = null;
    state.token = null;
    localStorage.removeItem("authToken");
  },
};

const actions = {
  async login({ commit }, userData) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const response = await fetchFromApi(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      commit("setAuth", response);
      return response;
    } catch (error) {
      console.error("Unable to login", error);
    }
  },
  async logout({ commit }) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const response = await fetchFromApi(`${apiUrl}/api/auth/logout`);
      commit("resetAuth");
      return response;
    } catch (error) {
      console.error("Unable to logout", error);
    }
  },
  async register({ commit }, userData) {
    try {
      const apiUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
      const response = await fetchFromApi(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      commit("setAuth", response);
      return response;
    } catch (error) {
      console.error("Unable to login", error);
    }
  },
  async checkAuth({ state, dispatch }) {
    const token = state.token;
    if (token) {
      try {
        const response = await fetchFromApi(`${apiUrl}/api/auth/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.invalid) {
          dispatch("refreshToken");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        dispatch("resetAuth");
      }
    }
  },

  async refreshToken({ state }) {
    try {
      const response = await fetchFromApi(`${apiUrl}/api/auth/refresh-token`);
      const newToken = response.data.token;
      state.token = newToken;
      localStorage.setItem("authToken", newToken);
    } catch (error) {
      console.error("Token refresh failed:", error);
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
