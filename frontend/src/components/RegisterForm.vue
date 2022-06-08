<template>
  <div class="q-pa-md">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="row">
          <div class="col-10">
            <div class="text-h6">{{ $t("register.register") }}</div>
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

      <q-card-section class="q-pt-none">
        <q-form class="q-gutter-md" ref="registrationForm">
          <q-input
            ref="nameInput"
            v-model="givenUserName"
            filled
            type="text"
            :label="$t('settings.nameLabel')"
            name="givenUserName"
            lazy-rules
            :rules="[
              (val) =>
                val.length < 100 ||
                $t('register.emailExceededNCharacters', { nChars: 100 }),
            ]"
          />

          <q-input
            v-model="email"
            filled
            type="email"
            :label="$t('register.email')"
            name="username"
            autocomplete="username"
            lazy-rules
            :rules="[
              (val) =>
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val) ||
                $t('register.emailInvalid'),
              (val) =>
                val.length < 100 ||
                $t('register.emailExceededNCharacters', { nChars: 100 }),
            ]"
          />

          <q-input
            v-model="password"
            filled
            :type="isPwd ? 'password' : 'text'"
            :label="$t('register.password')"
            autocomplete="new-password"
            lazy-rules
            :rules="[
              (val) =>
                val.length > 6 ||
                $t('register.passwordLongerThanNCharacters', { nChars: 6 }),
              (val) =>
                val.length < 1000 ||
                $t('register.passwordExceededNCharacters', { nChars: 1000 }),
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              /> </template
          ></q-input>

          <q-checkbox v-model="agbsAccepted">
            <i18n path="register.term" tag="label" for="register.tos">
              <a @click="openPrivacy" href="#" target="_blank">{{
                $t("register.tos")
              }}</a>
            </i18n>
          </q-checkbox>
        </q-form>
      </q-card-section>

      <q-card-section v-if="result.responseReceived">
        <q-banner
          rounded
          :class="[
            'text-white',
            result.success ? 'bg-positive' : 'bg-negative',
          ]"
          >{{ result.message }}</q-banner
        >
      </q-card-section>

      <q-card-section v-if="passwordCount > 0">
        <q-banner rounded :class="['text-white', 'bg-negative']">{{
          $t("register.passwordLeaked", {
            passwordCount: passwordCount.toString(),
          })
        }}</q-banner>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat :label="$t('general.cancel')" v-close-popup />
        <q-btn
          flat
          :label="
            result.responseReceived
              ? $t('general.close')
              : $t('register.register')
          "
          @click="onRegister"
          :disable="!isValid"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { userRegister } from "./../helpers/apiService";

export default {
  name: "RegisterForm",
  data() {
    return {
      email: "",
      password: "",
      isPwd: true,
      givenUserName: "",

      passwordCount: 0,
      agbsAccepted: false,
      result: {
        responseReceived: false,
        success: "",
        message: "",
      },
    };
  },
  methods: {
    async onRegister() {
      this.passwordCount = 0;

      if (this.result.responseReceived) {
        this.$emit("registrationDone");
      } else {
        this.passwordCount = await this.checkPassword(this.password);
        if (this.passwordCount <= 100) {
          const response = await userRegister({
            email: this.email,
            password: this.password,
            username: this.givenUserName.trim(),
          });
          this.result.responseReceived = true;
          if (response) {
            this.result.success = true;
            this.result.message = this.$t("register.registrationSuccess");
          } else {
            this.result.success = false;
            this.result.message = this.$t("register.registrationFail");
          }
        }
      }
    },
    async checkPassword(password) {
      const enc = new TextEncoder("utf-8").encode(password);
      let hash = await crypto.subtle.digest("SHA-1", enc);

      let hashStr = this.hex(hash).toUpperCase();

      const prefix = hashStr.substring(0, 5);
      const suffix = hashStr.substring(5);

      const pwndpwds = await fetch(
        "https://api.pwnedpasswords.com/range/" + prefix
      );
      const t = await pwndpwds.text();
      const list = t.split("\n").map((x) => {
        return {
          suffix: x.substring(0, x.indexOf(":")),
          count: parseInt(x.substring(x.indexOf(":") + 1).trim(), 10),
        };
      });
      console.debug(list);
      var index = list.findIndex((x) => x.suffix == suffix);
      if (index >= 0) {
        return list[index].count;
      } else {
        return 0;
      }
    },
    hex(a) {
      var h = "";
      var b = new Uint8Array(a);
      for (var i = 0; i < b.length; i++) {
        var hi = b[i].toString(16);
        h += hi.length === 1 ? "0" + hi : hi;
      }
      return h;
    },
    openPrivacy() {
      this.$router
        .push({
          name: "privacy",
        })
        .catch((err) => {});
    },
  },
  computed: {
    // isEmailValid() {
    //   // see https://www.w3resource.com/javascript/form/email-validation.php for this regex
    //   return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email);
    // },
    isPasswordValid() {
      return this.password.length >= 6;
    },
    isValid() {
      return (
        this.isEmailValid(this.email) &&
        this.isPasswordValid &&
        this.agbsAccepted
      );
    },
  },
  mounted() {
    setTimeout(() => this.$refs.nameInput.focus(), 50);
  },
};
</script>

<style>
</style>