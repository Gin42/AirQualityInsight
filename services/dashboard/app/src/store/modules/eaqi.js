const state = {};
const getter = {};
const mutations = {
  updateEAQI() {
    this.eaqi = calculateEAQI([
      this.statsMeasurement.data.pm25,
      this.statsMeasurement.data.pm10,
      this.statsMeasurement.data.no2,
      this.statsMeasurement.data.o3,
      this.statsMeasurement.data.so2,
    ]);
  },
};
const actions = {};

function calculateEAQI(pollutants) {
  let dominantPollutant = null;

  for (const pollutant of pollutants) {
    if (null === dominantPollutant) dominantPollutant = pollutant;
    if (dominantPollutant.intensity.value < pollutant.intensity.value)
      dominantPollutant = pollutant;
  }

  return dominantPollutant;
}

export default {
  state,
  actions,
  mutations,
};
