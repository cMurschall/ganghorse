<template>
  <q-scroll-area :style="{ height: height + 'vh' }">
    <q-list class="conversations borders-radius">
      <div
        v-for="(conversation, index) in conversationList"
        :key="conversation.id"
      >
        <q-item
          class="q-py-md"
          :class="{
            conversationSelected: aciveConversationId === conversation.id,
          }"
          :active="aciveConversationId === conversation.id"
          @click="$emit('change-conversation', conversation)"
          clickable
        >
          <q-item-section thumbnail>
            <!-- <q-icon color="gangHorseBlue" name="person"> </q-icon> -->
            <q-avatar class="q-ml-xs" color="gangHorseBlue" text-color="white">
              {{ conversation.horseName.substring(0, 1).toUpperCase() }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label> {{ conversation.horseName }}</q-item-label>
            <q-item-label caption>{{
              getMessagePreview(getLastMessage(conversation))
            }}</q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label
              caption
              v-if="unreadMessagesByConversationId(conversation.id)"
              >{{
                $t("messageCentre.unread", {
                  count: unreadMessagesByConversationId(conversation.id),
                })
              }}</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-separator
          v-if="index !== conversationList.length - 1"
          inset="spaced"
        />
      </div>
    </q-list>
  </q-scroll-area>
</template>

<script>
import { mapGetters } from "vuex";
import { messageMixin } from "./../../helpers/mixins";

export default {
  name: "ConversationList",
  props: ["conversationList", "aciveConversationId"],
  mixins: [messageMixin],
  methods: {
    getLastMessage(conversation) {
      if (conversation.messages.length) {
        return this.sortMessagesByDate(conversation.messages)[
          conversation.messages.length - 1
        ].text;
      }
      return "";
    },
    getMessagePreview(message) {
      const limit = 50;

      return message.length < limit
        ? message // if below limit return entire strting
        : message.substring(0, limit - 3) + "..."; // else return a substring
    },
  },
  computed: {
    ...mapGetters("conversationStore", ["unreadMessagesByConversationId"]),
  },
};
</script>

<style lang="scss" scoped>
.conversations {
  background: $grey-2;
}
.conversationSelected {
  background: $grey-4;
  border-radius: 0.3em;
}
</style>
