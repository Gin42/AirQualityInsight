export default {
  name: "TableComponent",
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
    defaultSort: {
      type: Object,
      default: () => ({ key: null, direction: "asc" }),
    },
  },
  data() {
    return {
      sortConfig: {
        key: this.defaultSort.key,
        direction: this.defaultSort.direction,
      },
    };
  },
  computed: {
    sortedData() {
      if (!this.sortConfig.key) {
        return this.data;
      }

      return [...this.data].sort((a, b) => {
        const aVal = a[this.sortConfig.key];
        const bVal = b[this.sortConfig.key];

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return this.sortConfig.direction === "asc" ? 1 : -1;
        if (bVal == null) return this.sortConfig.direction === "asc" ? -1 : 1;

        // Determine sort type based on value
        const isNumeric = !isNaN(aVal) && !isNaN(bVal);
        const isDate = this.isDateString(aVal) && this.isDateString(bVal);

        let comparison = 0;

        if (isNumeric) comparison = parseFloat(aVal) - parseFloat(bVal);
        else if (isDate) comparison = new Date(aVal) - new Date(bVal);
        else {
          // String comparison (case-insensitive)
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          comparison = aStr.localeCompare(bStr);
        }

        return this.sortConfig.direction === "asc" ? comparison : -comparison;
      });
    },
  },
  methods: {
    handleSort(column) {
      if (!column.sortable) return;
      if (false === column.sortable) return;

      if (this.sortConfig.key === column.key)
        this.sortConfig.direction =
          this.sortConfig.direction === "asc" ? "desc" : "asc";
      else {
        // Set new column and default to ascending
        this.sortConfig.key = column.key;
        this.sortConfig.direction = "asc";
      }

      // Emit sort event for parent component awareness
      this.$emit("sort-changed", {
        key: this.sortConfig.key,
        direction: this.sortConfig.direction,
      });
    },

    isDateString(value) {
      // Simple date detection - you might want to customize this based on your date formats
      if (typeof value !== "string") return false;

      // Check for common date patterns
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO datetime
      ];

      return (
        datePatterns.some((pattern) => pattern.test(value)) &&
        !isNaN(Date.parse(value))
      );
    },
    setSort(key, direction = "asc") {
      this.sortConfig.key = key;
      this.sortConfig.direction = direction;
    },
    clearSort() {
      this.sortConfig.key = null;
      this.sortConfig.direction = "asc";
    },
  },

  watch: {
    defaultSort: {
      handler(newSort) {
        this.sortConfig.key = newSort.key;
        this.sortConfig.direction = newSort.direction;
      },
      deep: true,
    },
  },
};
