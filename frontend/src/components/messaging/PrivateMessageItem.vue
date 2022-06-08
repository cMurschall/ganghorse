<template>
  <div class="full-width">
    <q-chat-message
      class="chatMessageBody"
      :text="[message.text]"
      :sent="isMyMessage"
      :name="displayName"
      :stamp="formatDate(message.createdAt)"
    >
      <template v-slot:avatar v-if="isMyMessage">
        <q-icon
          class="seenMark"
          :name="message.readByReceiver ? 'visibility' : 'visibility_off'"
        />
      </template>
    </q-chat-message>
  </div>
</template>

<script>
import { messageMixin } from "./../../helpers/mixins";
export default {
  name: "PrivateMessageItem",
  props: ["message", "previousMessage", "partnerName"],
  mixins: [messageMixin],
  methods: {
    markAsSeen() {
      if (!this.message.readByReceiver) {
        this.$socket.client.emit("MESSAGE_READ", this.message.id);
      }
    },
  },
  computed: {
    isMyMessage() {
      return this.message.senderUserId === this.currentUser.id;
    },
    showName() {
      if (this.previousMessage) {
        return this.previousMessage.senderUserId !== this.message.senderUserId;
      }
      return true;
    },
    displayName(){
      if(this.showName){
        return this.isMyMessage ? this.$t('messageCentre.me') : this.partnerName
      }
      return ''
    }
  },
  mounted() {
    this.markAsSeen();
  },
};
</script>

<style lang="scss" scoped>
.chatMessageBody {
  white-space: pre-line;
}
.seenMark {
  $size: 2em;
  margin-left: 1px;
  width: $size;
  height: $size;
  min-width: $size;
}
</style>
