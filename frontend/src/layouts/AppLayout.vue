<template>
  <q-layout view="lHh Lpr fff" class="bg-grey-1">
    <q-header bordered class="bg-white text-grey-8">
      <q-toolbar class="GPL__toolbar" style="height: 64px">
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="menu"
          class="q-mx-md"
        ></q-btn>

        <q-toolbar-title v-if="$q.screen.gt.sm" shrink class="row items-center no-wrap">
          <span v-if="$route.name !== 'home'" class="q-ml-sm cursor-pointer" @click="goToHome">{{
            $t("appLayout.home")
          }}</span>
        </q-toolbar-title>

        <q-space />

        <q-item v-if="false">
          <q-item-section>
            <!-- <q-img  src="~assets/Logo_mit-Claim.png" /> -->
            <!-- <div class="text-h5 text-accent">Beta version!</div> -->
            <!-- <img class="logoImage" src="~assets/Logo.svg" alt="Logo" /> -->
          </q-item-section>
        </q-item>

        <q-btn
          v-if="$q.screen.gt.xs && isLoggedIn && false"
          flat
          dense
          no-wrap
          color="primary"
          icon="add"
          no-caps
          :label="$t('appLayout.newAdvert')"
          class="q-ml-sm q-px-md"
          @click="openCreateHorse"
        ></q-btn>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-select
            v-model="currency"
            :options="getCurrencyMap()"
            option-value="index"
            option-label="value"
            :display-value="getCurrency(currency)"
            flat
            emit-value
            map-options
            dense
            @input="changeCurrency"
          />

          <q-select
            v-model="lang"
            :options="langOptions"
            option-value="value"
            option-label="label"
            flat
            emit-value
            map-options
            dense
            @input="changeLocale"
          >
            <template v-slot:option="scope">
              <q-item dense v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section avatar>
                  <q-icon :name="'img:' + scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-btn v-if="isLoggedIn && notificationCount" round dense flat color="grey-8" icon="notifications">
            <q-badge color="red" text-color="white" floating>{{ notificationCount }}</q-badge>
            <q-tooltip>{{ $t("appLayout.notification") }}</q-tooltip>

            <q-menu auto-close>
              <q-list>
                <q-item clickable @click="openMessageCentre">
                  <q-item-section>{{ $tc("appLayout.newMessage", unreadMessagesTotal) }}</q-item-section>
                </q-item>
                <q-separator />
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn v-if="isLoggedIn" round flat>
            <q-avatar size="26px">
              <img v-if="currentUser.avatarUrl" :src="currentUser.avatarUrl" />
              <q-icon v-else name="face">
                <!-- unreadMessagesTotal -->
              </q-icon>
            </q-avatar>
            <q-tooltip>{{ $t("appLayout.account") }}</q-tooltip>

            <q-menu auto-close>
              <q-list>
                <q-item>
                  <q-item-section>
                    <div>
                      {{
                        $t("appLayout.loggedInAs", {
                          logInName: currentUser.name || "User",
                        })
                      }}
                    </div>
                  </q-item-section>
                </q-item>
                <q-separator />

                <q-item clickable @click="onLogout">
                  <q-item-section>{{ $t("appLayout.logout") }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn-dropdown v-else :label="$t('general.login')" flat>
            <q-list>
              <q-item clickable v-close-popup @click="showLoginDialog = true">
                <q-item-section>
                  <q-item-label>{{ $t("general.login") }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="showRegistrationDialog = true">
                <q-item-section>
                  <q-item-label>{{ $t("appLayout.createAccount") }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-dialog v-model="showRegistrationDialog">
      <RegisterForm @registrationDone="showRegistrationDialog = false"></RegisterForm>
    </q-dialog>

    <q-dialog v-model="showLoginDialog">
      <LoginForm @loginDone="showLoginDialog = false"></LoginForm>
    </q-dialog>

    <q-drawer v-model="leftDrawerOpen" bordered behavior="mobile" @click="leftDrawerOpen = false">
      <q-scroll-area class="fit">
        <q-toolbar class="GPL__toolbar">
          <q-toolbar-title class="row items-center text-grey-8">
            <span v-if="$route.name !== 'home'" class="q-ml-sm cursor-pointer" @click="goToHome">{{
              $t("appLayout.home")
            }}</span>
            <q-img v-else src="~assets/Logo.svg" style="height: 2.5em" position="0 0" contain />
          </q-toolbar-title>
        </q-toolbar>

        <q-separator class="q-my-md" />

        <q-list padding>
          <q-item v-if="!isLoggedIn" clickable v-close-popup @click="showLoginDialog = true" class="GPL__drawer-item">
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t("general.loginForFunctions") }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="!isLoggedIn"
            clickable
            v-close-popup
            @click="showRegistrationDialog = true"
            class="GPL__drawer-item"
          >
            <q-item-section avatar>
              <q-icon name="person_add" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t("general.registerForFree") }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-for="link in userMenu"
            :key="link.text"
            @click="link.action"
            clickable
            :disable="!isLoggedIn"
            class="GPL__drawer-item"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item
            v-for="link in settinsMenu"
            :key="link.text"
            clickable
            :disable="!isLoggedIn"
            @click="link.action"
            class="GPL__drawer-item"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item v-for="link in legalMenu" :key="link.text" clickable @click="link.action" class="GPL__drawer-item">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item v-for="link in ownerMenu" :key="link.text" clickable @click="link.action" class="GPL__drawer-item">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="$q.screen.gt.sm">
            <div class="infoBox">
              <div class="infoText gt-sm">
                {{ $t("appLayout.supportMessage") }}
              </div>
              <div class="infoText" :class="$socket.connected ? 'text-black' : 'text-gray'">
                {{ gitVersion() }}
              </div>
            </div>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="GPL__page-container">
      <transition name="router">
        <router-view />
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import RegisterForm from "./../components/RegisterForm";
import LoginForm from "./../components/LoginForm";

export default {
  name: "AppLayout",
  components: { RegisterForm, LoginForm },
  data() {
    return {
      leftDrawerOpen: false,
      search: "",
      settinsMenu: [
        {
          icon: "settings",
          text: this.$t("appLayout.settings"),
          action: this.openSettings,
        },
      ],
      authentication: {
        selected: null,
        options: [
          { value: "github", label: "GitHub" },
          { value: "facebook", label: "Facebook" },
        ],
      },
      legalMenu: [
        {
          icon: "lock",
          text: this.$t("appLayout.privacy"),
          action: () => {
            this.$router
              .push({
                name: "privacy",
              })
              .catch((err) => {});
          },
        },
        {
          icon: "contact_mail",
          text: this.$t("appLayout.aboutUs"),
          action: () => {
            this.$router
              .push({
                name: "aboutUs",
              })
              .catch((err) => {});
          },
        },
      ],
      ownerMenu: [
        {
          icon: "comment",
          text: "Blog",
          action: () => {
            this.$router
              .push({
                name: "blog",
              })
              .catch((err) => {});
          },
        },
      ],
      userMenu: [
        {
          icon: "create",
          text: this.$t("appLayout.newAdvert"),
          action: this.openCreateHorse,
        },
        {
          icon: "list",
          text: this.$t("appLayout.myAdvert"),
          action: this.openOwnHorses,
        },
        {
          icon: "favorite",
          text: this.$t("appLayout.favorites"), //this.$t("appLayout.myAdvert"),
          action: this.openFavorites,
        },
        {
          icon: "email",
          text: this.$t("appLayout.messageCentre"), //this.$t("appLayout.myAdvert"),
          action: this.openMessageCentre,
        },
      ],
      showRegistrationDialog: false,
      showLoginDialog: false,
      langOptions: [
        {
          value: "en-gb",
          label: this.$t("appLayout.language.english"),
          icon: "flags/4x3/gb.svg",
        },
        {
          value: "de-de",
          label: this.$t("appLayout.language.german"),
          icon: "flags/4x3/de.svg",
        },
      ],
      lang: "",
    };
  },
  methods: {
    ...mapActions("userStore", ["logout"]),
    ...mapMutations("userStore", ["setUserCurrency"]),

    openCreateHorse() {
      this.$router
        .push({
          name: "createHorse",
        })
        .catch((err) => {});
    },
    openOwnHorses() {
      console.debug("ownHorses");
      this.$router
        .push({
          name: "ownHorses",
        })
        .catch((err) => {});
    },
    openFavorites() {
      console.debug("openFavorites");
      this.$router
        .push({
          name: "favorites",
        })
        .catch((err) => {});
    },
    openMessageCentre() {
      console.debug("openMessageCentre");
      this.$router
        .push({
          name: "messageCentre",
        })
        .catch((err) => {});
    },
    openSettings() {
      console.debug("openSettings");

      this.$router
        .push({
          name: "settings",
        })
        .catch((err) => {});
    },
    goToHome() {
      this.$router
        .push({
          name: "home",
        })
        .catch((err) => {});
    },
    changeLocale(lang) {
      if (process.env.MODE === "spa") {
        localStorage.setItem("userLang", lang);
      }

      this.$i18n.locale = lang;

      console.debug(this.$root.$i18n.locale);
      this.$root.$i18n.locale = lang;
      console.debug(this.$root.$i18n.locale);
    },
    changeCurrency(currency) {
      if (process.env.MODE === "spa") {
        localStorage.setItem("currency", currency);
        location.reload();
      }
    },
    onLogout() {
      this.logout();
      // to to home.
      this.$router
        .push({
          name: "home",
        })
        .catch((err) => {});
    },
  },
  computed: {
    ...mapGetters("userStore", ["isLoggedIn", "currentUser", "userCurrency"]),
    ...mapGetters("conversationStore", ["unreadMessagesTotal"]),

    notificationCount() {
      return this.unreadMessagesTotal;
    },
    currency: {
      get() {
        return this.userCurrency;
      },
      set(value) {
        this.setUserCurrency(value);
      },
    },
  },
  created() {
    var imageurl = this.pageImage();
    var pageDescription = this.pageDescription();

    if (process.env.MODE === "spa") {
      var image = new Image();
      image.onload = function () {
        // Inside here we already have the dimensions of the loaded image
        var style = [
          // Hacky way of forcing image's viewport using `font-size` and `line-height`
          "font-size: 1px;",
          "line-height: " + (this.height % 2) + "px;",

          // Hacky way of forcing a middle/center anchor point for the image
          "padding: " + this.height * 0.5 + "px " + this.width * 0.5 + "px;",

          // Set image dimensions
          "background-size: " + this.width + "px " + this.height + "px;",

          // Set image URL
          "background: no-repeat url(" + imageurl + ");",
        ].join(" ");

        if (navigator.userAgent.includes("Chrome")) {
          // notice the space after %c
          console.info("%c ", style);
        }

        console.info(
          `%cWillkommen bei Gang Horse\n%c${pageDescription}`,
          "font-size:1.5em;color:#89cde0;",
          "color:#4c4f56;font-size:1.1em;"
        );
      };

      image.src = imageurl;
    }
    this.lang = this.langOptions.find((x) => x.value == this.$i18n.locale);

    if (process.env.MODE === "spa") {
      var localStorageLang = localStorage.getItem("userLang");
      if (localStorageLang) {
        this.$i18n.locale = localStorageLang;
      }
    }
  },
};
</script>

<style lang="scss">
$toolbarHeight: 64px;
.GPL__toolbar {
  height: $toolbarHeight;

  .logoImage {
    height: $toolbarHeight;
  }
}

.GPL__toolbar-input {
  width: 35%;
}

.GPL__drawer-item {
  line-height: 24px;
  border-radius: 0 24px 24px 0;
  margin-right: 12px;

  .q-item__section--avatar {
    padding-left: 12px;

    .q-icon {
      color: #5f6368;
    }
  }

  .q-item__label:not(.q-item__label--caption) {
    color: #3c4043;
    letter-spacing: 0.01785714em;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
  }
}
.infoBox {
  position: fixed;
  left: 0.5em;
  bottom: 0.5em;
  .infoText {
    font-size: 0.8em;
  }
}
</style>
