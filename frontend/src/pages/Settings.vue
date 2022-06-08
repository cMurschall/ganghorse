<template>
  <q-page padding>
    <!-- content -->

    <div class="row">
      <div class="col-12 col-sm-9 offset-sm-1 col-md-6 offset-md-1">
        <q-card v-if="isLoggedIn">
          <q-form @submit="saveSettings" greedy>
            <q-card-section>
              <!-- <div class="text-h6">{{ $t('createHorse.newHorse') }}</div> -->
              <h1 class="text-h6">{{ $t("settings.mySettings") }}</h1>
            </q-card-section>

            <q-card-section style="minheight: 25em">
              <q-tabs
                v-model="tab"
                dense
                class="text-grey"
                active-color="gangHorseBlue"
                indicator-color="gangHorseBlue"
                align="justify"
                narrow-indicator
              >
                <q-tab name="general" :label="$t('settings.general')" />
                <q-tab
                  name="changePassword"
                  :label="$t('settings.changePassword')"
                />
                <q-tab
                  name="publicDescription"
                  :label="$t('settings.publicDescription')"
                />
                <q-tab
                  name="deleteAccount"
                  :label="$t('settings.deleteAccount')"
                />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="tab" animated>
                <q-tab-panel name="general">
                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          readonly
                          v-model="currentUser.email"
                          :label="$t('settings.emailLabel')"
                          :hint="$t('settings.emailHint')"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          v-model="userName"
                          :rules="[
                            (val) =>
                              val.length < 100 ||
                              $t('settings.nameMaxCharsError'),
                          ]"
                          :label="$t('settings.nameLabel')"
                          :hint="$t('settings.nameHint')"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-checkbox
                          left-label
                          color="gangHorseBlue"
                          v-model="canNotify"
                          :label="$t('settings.canNotify')"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <!-- <q-btn color="negative" flat label="Delete Account" /> -->
                      </div>
                    </div>
                  </div>
                </q-tab-panel>

                <q-tab-panel name="changePassword">
                  <q-form @submit="onChangePassword">
                    <div class="row">
                      <div class="col-12 col-sm-4">
                        <div class="q-pa-md">
                          <q-input
                            ref="oldPasswordInput"
                            v-model="changePassword.old"
                            :label="$t('settings.passwordOld')"
                            :type="
                              changePassword.isOldPwd ? 'password' : 'text'
                            "
                            lazy-rules
                            :rules="[
                              (val) =>
                                val.length > 6 ||
                                $t('register.passwordLongerThanNCharacters', {
                                  nChars: 6,
                                }),
                              (val) =>
                                val.length < 1000 ||
                                $t('register.passwordExceededNCharacters', {
                                  nChars: 1000,
                                }),
                            ]"
                          >
                            <template v-slot:append>
                              <q-icon
                                :name="
                                  changePassword.isOldPwd
                                    ? 'visibility_off'
                                    : 'visibility'
                                "
                                class="cursor-pointer"
                                @click="
                                  changePassword.isOldPwd = !changePassword.isOldPwd
                                "
                              />
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <div class="col-12 col-sm-4">
                        <div class="q-pa-md">
                          <q-input
                            ref="newPasswordInput"
                            v-model="changePassword.new"
                            :label="$t('settings.passwordNew')"
                            :type="
                              changePassword.isNewPwd ? 'password' : 'text'
                            "
                            lazy-rules
                            :rules="[
                              (val) =>
                                val.length > 6 ||
                                $t('register.passwordLongerThanNCharacters', {
                                  nChars: 6,
                                }),
                              (val) =>
                                val.length < 1000 ||
                                $t('register.passwordExceededNCharacters', {
                                  nChars: 1000,
                                }),
                            ]"
                          >
                            <template v-slot:append>
                              <q-icon
                                :name="
                                  changePassword.isNewPwd
                                    ? 'visibility_off'
                                    : 'visibility'
                                "
                                class="cursor-pointer"
                                @click="
                                  changePassword.isNewPwd = !changePassword.isNewPwd
                                "
                              />
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <div class="col-12 col-sm-4">
                        <div class="q-pa-md">
                          <q-btn
                            flat
                            color="gangHorseBlue"
                            :label="$t('settings.passwordChange')"
                            :loading="changePassword.loading"
                            type="submit"
                          />
                        </div>
                      </div>
                    </div>
                  </q-form>
                </q-tab-panel>

                <q-tab-panel name="publicDescription">
                  <div class="col-12 col-sm-12">
                    <div class="q-pa-md">
                      <q-editor
                        ref="editor_ref"
                        @paste.native="(evt) => pasteCapture(evt)"
                        v-model="userDescription"
                        filled
                        type="textarea"
                        :toolbar="editorToolbar()"
                      >
                        <template v-slot:showCharCount>
                          <small class="q-editor__toolbar-group"
                            >{{ userDescription.length }}/2000</small
                          >
                        </template>
                      </q-editor>
                      <div class="q-mt-xs">
                        <small
                          >({{ $t("settings.publicDescriptionHint") }})</small
                        >
                      </div>
                      <q-banner
                        rounded
                        class="q-mt-xs text-white bg-negative"
                        v-if="userDescription && userDescription.length > 2000"
                        >{{
                          $t("settings.publicDescriptionMaxCharError", {
                            maxChar: 2000,
                          })
                        }}</q-banner
                      >
                    </div>
                  </div>
                </q-tab-panel>

                <q-tab-panel name="deleteAccount">
                  <div class="column items-center">
                    <q-btn
                      class="col q-mt-xl"
                      color="negative"
                      flat
                      :label="$t('settings.deleteAccount')"
                      @click="confirmDelete = true"
                    />
                    <q-dialog v-model="confirmDelete" persistent>
                      <q-card>
                        <q-card-section class="row items-center">
                          <q-avatar
                            icon="delete_outline"
                            color="negative"
                            text-color="white"
                          />
                          <span class="q-ml-sm">{{
                            $t("settings.deleteConfirmation")
                          }}</span>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn
                            flat
                            :label="$t('general.cancel')"
                            color="gangHorseBlue"
                            v-close-popup
                          />
                          <q-btn
                            flat
                            :label="$t('general.yes')"
                            color="gangHorseBlue"
                            v-close-popup
                            @click="onAccountDelete"
                          />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </q-card-section>

            <q-card-actions align="center" style="minheight: 5em">
              <div v-show="!['changePassword', 'deleteAccount'].includes(tab)">
                <q-banner
                  v-if="uploadResult.done"
                  rounded
                  :class="[
                    'text-white',
                    uploadResult.success ? 'bg-positive' : 'bg-negative',
                  ]"
                  >{{ uploadResult.message }}</q-banner
                >

                <q-btn
                  v-else
                  :loading="loading"
                  type="submit"
                  flat
                  color="gangHorseBlue"
                  :label="$t('createHorse.save')"
                />
              </div>
            </q-card-actions>
          </q-form>
        </q-card>

        <div v-else>{{ $t("general.youAreNotLogedIn") }}</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import { userChangePassword } from "./../helpers/apiService";

export default {
  name: "Settings",
  meta() {
    return {
      title: "Gang Horse - " + this.$t("appLayout.settings"),
      meta: {
        ...this.createMetaTitle(
          "Gang Horse - " + this.$t("appLayout.settings")
        ),
      },
    };
  },
  data() {
    return {
      tab: "general",
      enableEdit: false,
      loading: false,
      uploadResult: {
        done: false,
        success: "",
        message: "",
      },
      changePassword: {
        loading: false,
        old: "",
        isOldPwd: true,
        new: "",
        isNewPwd: true,
      },
      confirmDelete: false,
    };
  },
  methods: {
    ...mapActions("userStore", ["updateUser"]),
    ...mapMutations("userStore", [
      "setUserName",
      "setUserDescription",
      "setUserCanNotify",
      "deleteAccount",
    ]),
    async saveSettings() {
      this.loading = true;
      const result = await this.updateUser({
        name: this.userName,
        publicDescription: this.userDescription.substring(0, 4000),
        canNotify: this.canNotify,
      });

      this.loading = false;
      this.$q.notify({
        message: result.success
          ? this.$t("settings.updateSettingSuccess")
          : this.$t("settings.updateSettingFail"),
        color: result.success ? "positive" : "negative",
      });
      if (result.success) {
        console.debug(this.$t("settings.updateSettingSuccess"));
      }
    },
    async onAccountDelete() {
      // await this.deleteAccount();

      this.$q.notify({
        message: "Account deleted",
        color: "positive",
      });
    },

    onInput(event) {
      // const file = event.target.files[index];
      const fileReader = new FileReader();

      fileReader.addEventListener("load", () => {
        this.avatarFile = {
          raw: event,
          url: fileReader.result,
        };
      });
      fileReader.readAsDataURL(event);
    },
    async onChangePassword() {
      this.changePassword.loading = true;

      const response = await userChangePassword({
        oldpassword: this.changePassword.old,
        newpassword: this.changePassword.new,
      });
      this.$q.notify({
        message: response
          ? this.$t("settings.passwordChangeSuccess")
          : this.$t("settings.passwordChangeFail"),
        color: response ? "positive" : "negative",
      });

      this.changePassword.loading = false;
      this.changePassword.old = "";
      this.$refs.oldPasswordInput.resetValidation();
      this.changePassword.new = "";
      this.$refs.newPasswordInput.resetValidation();
    },
    pasteCapture(evt) {
      let text, onPasteStripFormattingIEPaste;
      evt.preventDefault();
      if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
        text = evt.originalEvent.clipboardData.getData("text/plain");
        this.$refs.editor_ref.runCmd("insertText", text);
      } else if (evt.clipboardData && evt.clipboardData.getData) {
        text = evt.clipboardData.getData("text/plain");
        this.$refs.editor_ref.runCmd("insertText", text);
      } else if (window.clipboardData && window.clipboardData.getData) {
        if (!onPasteStripFormattingIEPaste) {
          onPasteStripFormattingIEPaste = true;
          this.$refs.editor_ref.runCmd("ms-pasteTextOnly", text);
        }
        onPasteStripFormattingIEPaste = false;
      }
    },
    _clone(o) {
      return JSON.parse(JSON.stringify(o));
    },
  },
  computed: {
    ...mapGetters("userStore", ["isLoggedIn", "currentUser"]),
    userName: {
      get() {
        return this.currentUser.name;
      },
      set(value) {
        this.setUserName(value);
      },
    },
    userDescription: {
      get() {
        return this.currentUser.publicDescription || "";
      },
      set(value) {
        this.setUserDescription(value);
      },
    },
    canNotify: {
      get() {
        return this.currentUser.canNotify || false;
      },
      set(value) {
        this.setUserCanNotify(value);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.passwordBorder {
  border: 2px solid gray;
}
</style>
