export default {
  name: "LogComponent",
  data() {
    return {
      entries: [],
      maxEntries: 25,
    };
  },
  methods: {
    getIconClass(type) {
      if ("info" === type) return "fas fa-info-circle";
      if ("warning" === type) return "fas fa-exclamation-triangle";
      if ("error" === type) return "fas fa-times-circle";
      return "fas fa-info-circle";
    },
    addInfo(message) {
      this.addLogEntry("info", message);
    },
    addWarning(message) {
      this.addLogEntry("warning", message);
    },
    addError(message) {
      this.addLogEntry("error", message);
    },
    clearLog() {
      this.entries = [];
    },
    addLogEntry(type, message) {
      const now = new Date();
      const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(
        2,
        "0"
      )}:${String(now.getSeconds()).padStart(2, "0")}`;

      const existingEntryIndex = this.entries.findIndex(
        (entry) =>
          entry.timestamp === timestamp &&
          entry.type === type &&
          entry.message === message
      );

      if (existingEntryIndex !== -1) {
        this.entries[existingEntryIndex].count =
          (this.entries[existingEntryIndex].count || 1) + 1;
        return;
      }

      this.entries.unshift({
        type,
        timestamp,
        message,
        count: 1,
      });

      if (this.entries.length > this.maxEntries)
        this.entries = this.entries.slice(0, this.maxEntries);
    },
  },
};
