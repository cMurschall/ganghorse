<template>
  <q-card v-if="isLoggedIn">
    <q-card-section>
      <div class="text-h5">{{ $t("horseDetail.privateMessages") }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-input
        color="gangHorseBlue"
        v-model="inputText"
        filled
        autogrow
        type="textarea"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
        :label="$t('horseDetail.typePrivateMessage')"
      >
        <template v-slot:append>
          <q-btn
            round
            flat
            autogrow
            icon="send"
            :disabled="!trimmedText.length"
            @click="sendMessage()"
          />
        </template>
      </q-input>
    </q-card-section>
  </q-card>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "PrivateMessageInput",
  props: ["horse"],
  data() {
    return {
      inputText: "",
    };
  },
  methods: {
    sendMessage() {
      const messageData = {
        horse: {
          horseId: this.horse.id,
          horseName: this.horse.name,
        },
        conversationPartnerId: this.horse.owner.id,

        text: this.trimmedText,
      };
      console.log("send off private message", messageData);
      this.$socket.client.emit("MESSAGE_SEND", messageData);

      this.inputText = ''
      // go to message centre
      this.$router
        .push({
          name: "messageCentre",
        })
        .catch((err) => {});
    },
  },
  computed: {
    ...mapGetters({
      isLoggedIn: "userStore/isLoggedIn",
    }),
    trimmedText() {
      return this.inputText.trim();
    },
  },
};
</script>

<style>
</style>