<template>
  <div class="q-pa-md">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="row">
          <div class="col-10">
            <div class="text-h6">{{ $t("general.login") }}</div>
          </div>
          <div class="col-2">
            <q-img
              src="~assets/Logo_ohne-Claim.png"
              contain
              style="height: 3em"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none" v-if="!showLoginResultProcess">
        <q-form class="q-gutter-md" v-if="!showEmailSendMessage">
          <q-input
            ref="emailInput"
            v-model="email"
            filled
            type="text"
            name="username"
            autocomplete="username"
            :label="$t('register.email')"
            lazy-rules
            @input="showLoginResult = false"
          />

          <q-input
            v-if="!showForgotPassword"
            v-model="password"
            filled
            id="password"
            :type="isPwd ? 'password' : 'text'"
            name="password"
            autocomplete="current-password"
            :label="$t('register.password')"
            lazy-rules
            v-on:keyup.enter="onLogin"
            @input="showLoginResult = false"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-checkbox
            flat
            v-model="showForgotPassword"
            :label="$t('login.forgotPasswordLabel')"
          />
        </q-form>
        <q-banner v-if="showEmailSendMessage" rounded>{{
          $t("login.resetMailSent")
        }}</q-banner>
      </q-card-section>

      <q-card-section class="q-pt-none" v-if="showLoginResult">
        <div class="row justify-center">
          <div class="col">
            <q-banner
              :class="[
                isLoggedIn ? 'bg-positive' : 'bg-negative',
                'text-white',
              ]"
              >{{
                isLoggedIn
                  ? $t("login.successMessage")
                  : $t("login.failureMessage")
              }}</q-banner
            >
          </div>
          <div class="col-md-auto" v-if="isLoggedIn">
            <q-circular-progress
              :value="showLoginResultProcess"
              size="3em"
              :thickness="0.2"
              :color="isLoggedIn ? 'positive' : 'negative'"
              track-color="grey-3"
              class="q-ma-sm"
              back
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          v-if="!showForgotPassword"
          flat
          label="Login"
          @click="onLogin"
          :disable="!isEmailValid(email)"
        />

        <q-btn v-else-if="showEmailSendMessage" flat label="OK" v-close-popup />

        <q-btn
          v-else
          flat
          :label="$t('login.resetPassword')"
          @click="onResetPassword"
          :disable="!isEmailValid(email)"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "LoginForm",
  data() {
    return {
      email: "",
      password: "",
      isPwd: true,
      showForgotPassword: false,
      showEmailSendMessage: false,

      showLoginResult: false,
      showLoginResultProcess: 0,
    };
  },
  methods: {
    ...mapActions("userStore", ["login", "forgotPassword"]),

    async onLogin() {
      console.log("try to log in");
      this.showLoginResult = false;
      await this.login({
        email: this.email,
        password: this.password,
      });
      this.showLoginResult = true;
      const updateIntervall = setInterval(
        () => (this.showLoginResultProcess += 5),
        5
      );
      await new Promise((r) => setTimeout(r, 1000));
      clearInterval(updateIntervall);

      if (this.isLoggedIn) {
        this.$emit("loginDone");
      }

      //
      // this.$q.notify({
      //   message: this.isLoggedIn
      //     ? this.$t("login.successMessage")
      //     : this.$t("login.failureMessage"),
      //   color: this.isLoggedIn ? "positive" : "negative",
      // });
    },
    async onResetPassword() {
      console.log("onResetPassword");

      if (this.showForgotPassword) {
        console.log("onResetPassword");
        this.showEmailSendMessage = false;
        const resetData = {
          email: this.email,
        };
        await this.forgotPassword(resetData);

        // show message
        this.showEmailSendMessage = true;
      }
    },
  },
  computed: {
    ...mapGetters("userStore", ["isLoggedIn"]),
  },
  mounted() {
    setTimeout(() => this.$refs.emailInput.focus(), 50);
  },
};
</script>

<style>
</style>