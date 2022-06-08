<template>
  <q-page padding>
    <!-- content -->
    <div class="row justify-center q-col-gutter-xs">
      <div class="col-12 col-sm-10 col-md-6">
        <q-card>
          <q-card-section>
            <!-- <div class="text-h6">{{ $t('createHorse.newHorse') }}</div> -->
            <div class="text-h6">Forgotten Password</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="onChangePassword" class="q-gutter-md">
              <q-input
                v-model="newPassword"
                filled
                :type="isPwd ? 'password' : 'text'"
                name="password"
                :label="$t('register.password')"
                lazy-rules
                :rules="[
                  (val) =>
                    val.length > 6 ||
                    $t('register.passwordLongerThanNCharacters', { nChars: 6 }),
                  (val) =>
                    val.length < 1000 ||
                    $t('register.passwordExceededNCharacters', {
                      nChars: 1000,
                    }),
                ]"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  /> </template
              ></q-input>

              <div class="row justify-end">
                <q-btn
                  type="submit"
                  flat
                  label="Change Password"
                  color="primary"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "ForgottenPassword",
  data() {
    return {
      newPassword: "",
      isPwd: true,
    };
  },
  methods: {
    ...mapActions("userStore", ["changeforgotPassword"]),
    async onChangePassword() {
      var resetData = {
        token: this.$route.params.token,
        newpassword: this.newPassword,
      };
      await this.changeforgotPassword(resetData);

      this.$router
        .push({
          name: "home",
        })
        .catch((err) => {});
    },
  },
  computed: {
    token() {
      return this.$route.params;
    },
  },
  mounted() {},
};
</script>
