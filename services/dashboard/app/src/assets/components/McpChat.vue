<script>
import { nextTick } from "vue";
import { mapActions } from "vuex";

const MessageFrom = {
  AI: "ai",
  USER: "user",
};

export default {
  name: "McpChat",
  watch: {
    messages() {
      this.scrollToBottom();
    },
    userPrompt() {
      this.adjustTextAreaHeight();
    },
  },
  data() {
    return {
      isOpen: false,
      loading: false,
      userPrompt: "",
      messages: [
        {
          from: MessageFrom.AI,
          text: "Hello, I'm AirQualityInsight virtual assistant.\nYou can request information about the sensors or ask me to perform some actions on them",
        },
      ],
    };
  },
  methods: {
    ...mapActions("sensors", ["refreshSensors"]),

    async sendMessage() {
      if (!this.userPrompt.trim()) return;

      this.loading = true;

      // push USER message
      this.messages.push({
        from: MessageFrom.USER,
        text: this.userPrompt,
      });

      this.scrollToBottom();

      try {
        const res = await fetch("http://localhost:4000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: this.userPrompt }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const response = await res.json();

        // push AI message
        this.messages.push({
          from: MessageFrom.AI,
          text: response.answer,
        });

        this.refreshSensors();
      } catch (err) {
        console.error("Chat request failed:", err);

        this.messages.push({
          from: MessageFrom.AI,
          text: "Failed to get response. Try again.",
        });
        this.scrollToBottom();
      } finally {
        this.loading = false;
        this.userPrompt = "";
        this.$nextTick(() => {
          this.resetTextAreaHeight();
        });
      }
    },

    scrollToBottom() {
      nextTick(() => {
        const el = this.$refs.chatContainer;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
      });
    },

    adjustTextAreaHeight() {
      const textArea = this.$refs.textArea;
      if (!textArea) return;

      textArea.style.height = "auto";

      if (this.userPrompt.trim() !== "") {
        textArea.style.height = `${textArea.scrollHeight}px`;
      }
    },

    resetTextAreaHeight() {
      const textArea = this.$refs.textArea;
      if (!textArea) return;

      textArea.style.height = "auto";
    },
  },
};
</script>

<template>
  <div class="chatbot">
    <div class="chatbot-button-icon">
      <button class="primary-color chatbot-button" @click="isOpen = !isOpen">
        <img src="../chatbot-icon.svg" alt="Chatbot" />
      </button>
    </div>

    <transition name="chat-slide">
      <div class="chat-container surface-color" v-if="isOpen">
        <button
          class="icon-button close-chat-button text-color"
          @click="isOpen = !isOpen"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div ref="chatContainer" class="inner-chat">
          <div class="messages">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="chat-message"
              :class="msg.from"
            >
              {{ msg.text }}
            </div>
          </div>

          <p v-if="loading" class="chat-message ai loading-message">
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
          </p>

          <div class="input-container">
            <textarea
              v-model="userPrompt"
              placeholder="Ask something..."
              @keyup.enter="sendMessage"
              :disabled="loading"
              class="surface-color chat-input"
              rows="1"
              ref="textArea"
            ></textarea>

            <button
              @click="sendMessage"
              :disabled="loading"
              class="input-send-button icon-button"
            >
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss">
.chatbot {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 0.5rem;
}

.chatbot-button-icon {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.chatbot-button {
  padding: 0.5rem;
  border-radius: 50%;
  grid-area: 1 / 2 / 2 / 3;
  width: 4rem;
  aspect-ratio: 1/1;
  justify-self: end;

  img {
    width: 2.5rem;
  }
}

/* entering */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s ease;
  transition-delay: 0.05s;
}

/* start hidden */
.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* fully visible */
.chat-slide-enter-to,
.chat-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.chat-container {
  display: flex;
  flex-direction: column;
  max-width: 20rem;
  max-height: 30rem;
  border: 1px solid black;
  border-radius: 8px;
}

.inner-chat {
  overflow-y: scroll;
  scroll-behavior: smooth;
  padding: 0rem 0.5rem 0.5rem 0.5rem;
  margin: 0rem 0.5rem 0.5rem 0.5rem;
}

.input-send-button {
  margin-right: 0.5rem;
  font-size: 1.2em;
}

.input-container {
  border: 1px solid black;
  border-radius: 16px;
  display: flex;
  flex-direction: row;
  padding: 0.5rem;
  justify-content: space-between;
}

.chat-input {
  width: 100%;
  height: auto;
  min-height: 1.5rem;
  max-height: 6rem;
  overflow-y: auto;
  resize: none;
  padding: 0.5rem;
  border: none;

  :focus {
    outline: none;
  }
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.chat-message {
  max-width: 90%;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  white-space: pre-wrap;
  width: fit-content;
}

.chat-message.user {
  align-self: flex-end;
  background: var(--tertiary-color);
}

.chat-message.ai {
  align-self: flex-start;
  background: var(--primary-color);
}

.loading-message {
  display: flex;
  gap: 2px;
}

.loading-message .dot {
  animation: blink 1.4s infinite both;
}

.loading-message .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-message .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}

@media (max-width: 425px) {
  .chat-container {
    max-width: 15rem;
  }
}
</style>
