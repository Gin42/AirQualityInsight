<script>
import { ref } from "vue";

export default {
  name: "McpChat",
  setup() {
    const message = ref("");
    const response = ref(null);
    const loading = ref(false);

    async function sendMessage() {
      loading.value = true;
      response.value = null;

      try {
        const res = await fetch("http://localhost:4000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: message.value }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        response.value = await res.json();

        console.log("Response received:", response.value?.answer);
      } catch (err) {
        console.error("Chat request failed:", err);
        response.value = { answer: "Failed to get response. Try again." };
      } finally {
        loading.value = false;
      }
    }

    return { message, response, loading, sendMessage };
  },
};
</script>

<template>
  <div class="chat">
    <h3>Air Quality Assistant</h3>

    <input
      v-model="message"
      placeholder="Ask something..."
      @keyup.enter="sendMessage"
      :disabled="loading"
    />

    <button @click="sendMessage" :disabled="loading">Send</button>

    <p v-if="loading">Thinking…</p>

    <pre v-if="response">{{ response.answer }}</pre>
  </div>
</template>
