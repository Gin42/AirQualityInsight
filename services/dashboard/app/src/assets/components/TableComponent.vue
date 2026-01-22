<!-- components/TableComponent.vue -->
<script src="./logic/TableComponentLogic.js"></script>
<template>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr class="secondary-color">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="{
              'text-center': column.center,
              sortable: column.sortable && false !== column.sortable,
              sorted: sortConfig.key === column.key,
            }"
            @click="handleSort(column)"
          >
            <div class="th-content">
              <span v-if="column.html" v-html="column.label"></span>
              <span v-else>{{ column.label }}</span>
              <div
                v-if="column.sortable && false !== column.sortable"
                class="sort-indicators"
              >
                <i
                  class="fas fa-caret-up sort-arrow"
                  :class="{
                    active:
                      sortConfig.key === column.key &&
                      sortConfig.direction === 'asc',
                  }"
                ></i>
                <i
                  class="fas fa-caret-down sort-arrow"
                  :class="{
                    active:
                      sortConfig.key === column.key &&
                      sortConfig.direction === 'desc',
                  }"
                ></i>
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in sortedData"
          :key="index"
          @click="$emit('row-click', row)"
          class="table-row"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="{ 'text-center': column.center }"
          >
            <span v-if="column.html" v-html="row[column.key]"></span>
            <span v-else>{{ row[column.key] }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="data.length === 0" class="no-data">No data to display</div>
  </div>
</template>

<style scoped lang="scss">
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  height: 500px;
}

table {
  width: 100%;
}

table,
th,
td {
  border: 1px solid black;
  border-collapse: collapse;
}

tbody tr {
  font-family: monospace;
  font-size: 1em;
}

th,
td {
  padding: 0.5rem;
  text-align: left;

  &.text-center {
    text-align: center;
  }
}

th {
  position: sticky;
  font-weight: bold;

  .th-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .sort-indicators {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: -2px;
    min-width: 12px;

    .sort-arrow {
      font-size: 10px;
      //color: #bbb;
      transition: color 0.2s;
      line-height: 1;
    }
  }

  &.text-center .th-content {
    justify-content: center;
  }
}

.no-data {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}
</style>
