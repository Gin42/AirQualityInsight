<!-- components/TableComponent.vue -->
<script src="./logic/TableComponentLogic.js"></script>
<template>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
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

  .table-row {
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }
  }
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;

  &.text-center {
    text-align: center;
  }
}

th {
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 2px solid #dee2e6;
  background-color: #f9f9f9;
  font-weight: 600;
  user-select: none;

  &.sortable {
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #e9ecef;
    }
  }

  &.sorted {
    background-color: #e3f2fd;
  }

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
      color: #bbb;
      transition: color 0.2s;
      line-height: 1;

      &.active {
        color: #007bff;
      }
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
