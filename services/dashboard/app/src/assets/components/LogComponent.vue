<!-- components/LogComponent.vue -->
<template>
  <div class="log-container">
    <div v-if="entries.length === 0" class="log-entry empty">
      No log entries to display
    </div>
    <div v-for="(entry, index) in entries" :key="index" class="log-entry">
      <div class="log-icon" :class="'log-' + entry.type">
        <i :class="getIconClass(entry.type)"></i>
      </div>
      <div class="log-content">
        <span class="log-timestamp">{{ entry.timestamp }}</span>
        <span class="log-message">{{ entry.message }}</span>
        <span v-if="entry.count && entry.count > 1" class="log-counter"
          >({{ entry.count }})</span
        >
      </div>
    </div>
  </div>
</template>

<script src="./logic/LogComponentLogic.js"></script>

<style>
.log {
  &-container {
    overflow-y: auto;
  }

  &-entry {
    padding: 0.5rem 0;
    display: flex;
    align-items: flex-start;

    &:not(:last-of-type) {
      border-bottom: 1px solid #eee;
    }

    &.empty {
      color: #666;
      font-style: italic;
      padding: 1rem 0;
      text-align: center;
      justify-content: center;
    }
  }

  &-icon {
    margin-right: 10px;
    width: 1.5rem;
    text-align: center;
    padding-top: 2px;
  }

  &-content {
    flex: 1;
  }

  &-timestamp {
    font-weight: bold;
    margin-right: 0.5rem;
  }

  &-message {
    margin-right: 0.5rem;
  }

  &-counter {
    color: #666;
    font-weight: bold;
    font-size: 0.9em;
    background-color: #f0f0f0;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
  }

  &-info {
    color: #2196f3;
  }

  &-warning {
    color: #ff9800;
  }

  &-error {
    color: #f44336;
  }
}
</style>
