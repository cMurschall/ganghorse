<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">{{ $t("horseDetail.publicMessages") }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="chatMessageBackground">
        <q-item v-for="message in messages" :key="message.id">
          <div class="full-width">
            <q-chat-message
              class="chatMessageBody"
              :name="message.author.name"
              :sent="message.author.id == horse.owner.id"
              :text="[message.text]"
              :stamp="formatDate(message.createdAt)"
            ></q-chat-message>
          </div>
        </q-item>
      </div>
    </q-card-section>

    <q-separator inset />
    <q-card-section>
      <q-form v-if="isLoggedIn">
        <q-input
          type="textarea"
          v-model="message"
          filled
          autogrow
          :label="$t('horseDetail.typePublicMessage')"
          @focus="$emit('focus')"
          @blur="$emit('blur')"
          @keyup="onInput"
          :rules="[
            (val) =>
              val.length <= 5000 ||
              $t('messageCentre.errorMaxCharacters', { n: 5000 }),
          ]"
        >
          <template v-slot:append>
            <q-btn
              type="submit"
              @click="onSendMessage"
              round
              dense
              flat
              icon="send"
            />
          </template>
        </q-input>
      </q-form>
      <q-banner rounded class="bg-grey-3" v-else>{{
        $t("horseDetail.loginToWriteMessage")
      }}</q-banner>
    </q-card-section>
  </q-card>
</template>

<script>
import { date, debounce } from "quasar";
import { mapGetters, mapActions } from "vuex";
export default {
  name: "PublicMessageInput",

  props: ["horse"],
  data() {
    return {
      message: "",
    };
  },
  methods: {
    ...mapActions("messageStore", ["sendMessage"]),
    async onSendMessage() {
      await this.sendMessage({
        text: this.message,
        topic: this.horse.id,
      });
      this.message = "";
    },
    onInput(param) {
      // console.log("onInput", param.target.val());
      // send typing signal todo:
    },
    formatDate(timeStamp) {
      return date.formatDate(timeStamp, "DD.MM.YYYY HH:mm");
    },
  },
  computed: {
    ...mapGetters({
      isLoggedIn: "userStore/isLoggedIn",
      messages: "messageStore/messages",
    }),
  },
  created() {
    this.onInput = debounce(this.onInput, 500);
  },
};
</script>

<style lang="scss" scoped>
.chatMessageBackground {
  width: 100%;
  max-width: 400px;
  background: $grey-1;
  margin: 1em;

  .chatMessageBody {
    white-space: pre-line;
  }
}
</style>