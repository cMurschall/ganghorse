<template>
  <div>
    <q-scroll-area :style="{ height: height + 'vh' }" ref="chatScrollArea">
      <div class="chatMessageBackground">
        <q-item v-for="(message, index) in messages" :key="message.id">
          <PrivateMessageItem
            :message="message"
            :previousMessage="messages[index - 1]"
            :partnerName="partnerName"
          />
        </q-item>
      </div>
    </q-scroll-area>
    <q-form>
      <div class="full-width">
        <div class="q-pt-md">
          <q-input
            color="gangHorseBlue"
            v-model="inputText"
            filled
            autogrow
            type="textarea"
            :rules="[
              (val) =>
                val.length <= messageMaxLength ||
                $t('messageCentre.errorMaxCharacters', { n: messageMaxLength }),
            ]"
            :label="$t('messageCentre.typeMessage')"
          >
            <template v-slot:append>
              <div class="sendButton">
                <q-btn
                  round
                  flat
                  autogrow
                  icon="send"
                  :disabled="!trimmedText.length"
                  @click="sendMessage()"
                />
              </div>
            </template>
          </q-input>
        </div>
      </div>
    </q-form>
  </div>
</template>

<script>
import PrivateMessageItem from "./PrivateMessageItem";
import { messageMixin } from "./../../helpers/mixins";

export default {
  name: "",
  components: { PrivateMessageItem },
  props: ["selectedConversation", "partnerName"],
  mixins: [messageMixin],
  data() {
    return {
      inputText: "",
    };
  },
  methods: {
    sendMessage() {
      const messageData = {
        conversationId: this.selectedConversation.id,
        conversationPartnerId: this.getPartnerId(this.selectedConversation),
        text: this.trimmedText,
      };
      console.log("send off private message", messageData);
      this.$socket.client.emit("MESSAGE_SEND", messageData);

      this.inputText = "";
    },
    scrollToEnd() {
      // need to wait a little bit until vue nextTick
      setTimeout(() => {
        this.$refs.chatScrollArea.setScrollPosition(1000 * 1000);
      }, 10);
    },
  },
  computed: {
    messageCount() {
      return this.selectedConversation.messages.length;
    },
    conversationId() {
      return this.selectedConversation.id;
    },
    trimmedText() {
      return this.inputText.trim();
    },
    messages() {
      return this.sortMessagesByDate(this.selectedConversation.messages);
    },
  },
  watch: {
    conversationId() {
      // conversation changed
      this.scrollToEnd();
    },
    messageCount() {
      // new message arrived
      this.scrollToEnd();
    },
  },
  mounted() {
    this.scrollToEnd();
  },
};
</script>

<style>
.sendButton {
  /* position: absolute; */
}
</style>