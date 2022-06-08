<template>
  <q-page padding>
    <!-- content -->
    <div class="row justify-center">
      <div class="col-12 col-xs-12">
        <q-card v-if="isLoggedIn">
          <q-card-section>
            <div class="text-h6">{{ $t("messageCentre.messageCentre") }}</div>
          </q-card-section>
          <q-card-section>
            <div class="row">
              <div
                class="col-10 col-md-10 col-xs-12"
                :class="[{ 'q-pa-md': !isMobile }]"
              >
                <div class="row">
                  <div
                    v-if="isMobile ? mobileView.showConversations : true"
                    :class="[
                      isMobile ? 'col-12' : 'col-4',
                      { 'q-pa-md': !isMobile },
                    ]"
                  >
                    <ConversationList
                      :conversationList="conversations"
                      :aciveConversationId="
                        selectedConversation ? selectedConversation.id : ''
                      "
                      @change-conversation="changeConversationClick"
                    />
                  </div>
                  <!-- <div class="col q-pa-md" v-if="selectedConversation"> -->
                  <div
                    v-if="isMobile ? !mobileView.showConversations : true"
                    :class="[
                      isMobile ? 'col-12' : 'col-8',
                      { 'q-pa-md': !isMobile },
                    ]"
                  >
                    <div v-if="selectedConversation">
                      <q-btn
                        v-if="isMobile"
                        color="gangHorseBlue"
                        unelevated
                        class="full-width q-mb-md"
                        icon="arrow_back"
                        align="left"
                        :label="$t('messageCentre.backToConversations')"
                        @click="mobileView.showConversations = true"
                      />

                      <div class="messages rounded-borders">
                        <!-- put more love here todo -->
                        <div
                          caption
                          class="q-pa-md center-text selectedConversationUserInfo"
                        >
                          {{
                            $t("messageCentre.userDescripion", {
                              user: selectedConversationUserInfo.name,
                              horseName: selectedConversation.horseName,
                            })
                          }}
                        </div>

                        <MessageList
                          :selectedConversation="selectedConversation"
                          :partnerName="selectedConversationUserInfo.name"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
        <div v-else>{{ $t("general.youAreNotLogedIn") }}</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { date } from "quasar";
import { mapGetters, mapActions } from "vuex";
import { messageMixin } from "./../helpers/mixins";

import PrivateMessageItem from "./../components/messaging/PrivateMessageItem";
import ConversationList from "./../components/messaging/ConversationList";
import MessageList from "./../components/messaging/MessageList";

export default {
  name: "MessgeCenter",
  components: { ConversationList, MessageList, PrivateMessageItem },
  mixins: [messageMixin],
  meta() {
    return {
      title: "Gang Horse - " + this.$t("appLayout.messageCentre"),
      meta: {
        ...this.createMetaTitle(
          "Gang Horse - " + this.$t("appLayout.messageCentre")
        ),
      },
    };
  },
  data() {
    return {
      selectedConversation: undefined,
      selectedConversationUserInfo: {},
      mobileView: {
        showConversations: true,
      },
    };
  },
  methods: {
    // ...mapActions("conversationStore", ["fetchConversations"]),
    // ...mapActions("horseStore", ["fetchHorseById"]),
    ...mapActions("userStore", ["fetchUserById"]),

    async changeConversation(conversation) {
      this.selectedConversation = conversation;
      const partnerInfo = await this.fetchUserById(
        this.getPartnerId(conversation)
      );
      this.selectedConversationUserInfo = partnerInfo;
    },
    async changeConversationClick(conversation) {
      await this.changeConversation(conversation);
      if (this.isMobile) {
        this.mobileView.showConversations = false;
      }
    },
  },
  computed: {
    ...mapGetters("conversationStore", ["conversations"]),
    selectedConversationPartner() {
      if (this.selectedConversation) {
      }
    },
    showConversationList() {
      if (this.isMobile) {
        return this.mobileView.showConversations;
      } else {
        return true;
      }
    },
  },
  async mounted() {
    // await this.fetchConversations();
    if (this.conversations.length) {
      await this.changeConversation(this.conversations[0]);
    }
  },
};
</script>

<style lang="scss" scoped>
.chatMessageBackground {
  width: 100%;
  // max-width: 400px;
  // background: $grey-1;
}

.messages {
  background: $grey-1;
}
.selectedConversationUserInfo {
  background: $grey-3;
}
</style>
