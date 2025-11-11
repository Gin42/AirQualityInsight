const state = {};
const getter = {};
const mutations = {
  updateEAQI() {
    this.eaqi = this.calculateEAQI([
      this.statsMeasurement.data.pm25,
      this.statsMeasurement.data.pm10,
      this.statsMeasurement.data.no2,
      this.statsMeasurement.data.o3,
      this.statsMeasurement.data.so2,
    ]);
  },
};
const actions = {};
