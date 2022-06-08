<template>
  <q-page padding>
    <div class="row">
      <div class="col-12 col-sm-9 offset-sm-1 col-md-6 offset-md-1">
        <q-card v-if="isLoggedIn">
          <!-- <q-form url @submit="uploadVideo" greedy></q-form> -->
          <q-form @submit="saveHorse" greedy>
            <q-card-section>
              <h1 class="text-h6">{{ inEditMode ? $t("createHorse.editHorse") : $t("createHorse.newHorse") }}</h1>
            </q-card-section>
            <q-card-section>
              <div>
                <div>
                  <div class="row justify-center">
                    <div class="col-8 col-sm-8">
                      <div class="q-pa-md">
                        <q-input
                          :loading="loadingWorldFengurInfo"
                          maxlength="12"
                          autofocus
                          clearable
                          clear-icon="close"
                          v-model="newHorse.feifId"
                          :label="$t('createHorse.feifId')"
                          mask="AA##########"
                          @clear="clearData"
                          @input="onFeifIdInput"
                          :error="serverRejectedFeifId"
                          error-message="Server rejected feif Id"
                          color="gangHorseBlue"
                        />
                        <q-linear-progress
                          v-show="loadingWorldFengurInfo"
                          color="gangHorseBlue"
                          :value="loadingStateProgress"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="text-weight-medium section">{{ $t("createHorse.basicInfo") }}</div>

                  <div class="q-pa-md">
                    <div class="row justify-between col-gutter-pa-md">
                      <div class="col-4">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.firstName"
                          :label="$t('createHorse.nameOfHorse')"
                          color="gangHorseBlue"
                          lazy-rules
                          :rules="[
                            (val) => !!val || $t('createHorse.requiredField'),
                            (val) => val.length < 200 || $tc('createHorse.maxNcharacters', 200),
                          ]"
                        />
                      </div>

                      <div class="col-2">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.prefix"
                          :label="$t('createHorse.preposition')"
                          lazy-rules
                          :rules="[
                            (val) => !!val || $t('createHorse.requiredField'),
                            (val) => val.length < 20 || $tc('createHorse.maxNcharacters', 20),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>

                      <div class="col-4">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.origin"
                          :label="$t('createHorse.horseOrigin')"
                          lazy-rules
                          :rules="[
                            (val) => !!val || $t('createHorse.requiredField'),
                            (val) => val.length < 200 || $tc('createHorse.maxNcharacters', 200),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.yearOfBirth"
                          :label="$t('createHorse.yearOfBirth')"
                          lazy-rules
                          mask="####"
                          :rules="[(val) => /^\d{4}$/.test(val) || $t('createHorse.errorInvalidYear')]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-select
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.gender"
                          :options="getGenderMap()"
                          option-value="index"
                          option-label="value"
                          :label="$t('createHorse.gender')"
                          emit-value
                          map-options
                          lazy-rules
                          :rules="[(val) => [0, 1, 2].includes(val) || $t('createHorse.requiredField')]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.height"
                          :label="$t('createHorse.height')"
                          mask="#.##"
                          lazy-rules
                          :rules="[(val) => /^1.[0-9]{1,2}$/.test(val) || $t('createHorse.invalidHorseHight')]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-select
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.color"
                          :options="getColorMap()"
                          option-value="index"
                          option-label="value"
                          :label="$t('createHorse.furColor')"
                          emit-value
                          map-options
                          lazy-rules
                          :rules="[
                            (val) =>
                              getColorMap()
                                .map((x) => x.index)
                                .includes(val) || $t('createHorse.requiredField'),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <location-input
                          :disable="!validFeifId"
                          :initalLocation="location"
                          @select="newHorse.location = $event"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-select
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.hasEczema"
                          :options="[
                            { label: $t('general.yes'), value: true },
                            { label: $t('general.no'), value: false },
                          ]"
                          :label="$t('horseDetail.sweetItch')"
                          emit-value
                          map-options
                          lazy-rules
                          :rules="[(val) => val != null || $t('createHorse.requiredField')]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- <div class="row">{{newHorse.priceMin}} - {{newHorse.priceMax}}</div> -->
                  <div class="row justify-between q-pa-md">
                    <q-toggle
                      class="col-3"
                      left-label
                      :disable="!validFeifId"
                      v-model="showPriceRange"
                      color="gangHorseBlue"
                      :label="showPriceRange ? $t('createHorse.showPriceRange') : $t('createHorse.showFixedPrice')"
                    />
                    <div v-if="showPriceRange" class="col-9">
                      <div class="row">
                        <q-input
                          ref="priceRangeMinInput"
                          class="col"
                          clearable
                          :disable="!validFeifId"
                          clear-icon="close"
                          v-model="inputpriceRangeMin"
                          :label="$t('createHorse.priceMinLabel')"
                          lazy-rules
                          :rules="[
                            (val) => /^[0-9]+$/.test(val) || $t('createHorse.errorInvalidPrice'),
                            (val) => val <= newHorse.priceMax || 'Price min must be smaller than price max',
                          ]"
                          color="gangHorseBlue"
                        ></q-input>
                        <q-input
                          ref="priceRangeMaxInput"
                          class="col"
                          clearable
                          :disable="!validFeifId"
                          clear-icon="close"
                          v-model="inputpriceRangeMax"
                          :label="$t('createHorse.priceMaxLabel')"
                          lazy-rules
                          :rules="[
                            (val) => /^[0-9]+$/.test(val) || $t('createHorse.errorInvalidPrice'),
                            (val) => val >= newHorse.priceMin || 'Price max must be greater than price min',
                          ]"
                          color="gangHorseBlue"
                        >
                          <template v-slot:append>
                            <q-select
                              :disable="!validFeifId"
                              style="margin-left: 1rem"
                              v-model="newHorse.currency"
                              :options="getCurrencyMap()"
                              option-value="index"
                              option-label="value"
                              emit-value
                              map-options
                              color="gangHorseBlue"
                            />
                          </template>
                        </q-input>
                      </div>
                    </div>

                    <q-input
                      v-else
                      class="col-8"
                      clearable
                      :disable="!validFeifId"
                      clear-icon="close"
                      v-model="inputpriceFixed"
                      :label="$t('createHorse.price')"
                      lazy-rules
                      :rules="[(val) => /^[0-9]+$/.test(val) || $t('createHorse.errorInvalidPrice')]"
                      color="gangHorseBlue"
                    >
                      <template v-slot:append>
                        <q-select
                          :disable="!validFeifId"
                          style="margin-left: 1rem"
                          v-model="newHorse.currency"
                          :options="getCurrencyMap()"
                          option-value="index"
                          option-label="value"
                          emit-value
                          map-options
                          color="gangHorseBlue"
                        />
                      </template>
                    </q-input>
                  </div>

                  <div class="text-weight-medium section">{{ $t("createHorse.ancestryFatherLine") }}</div>

                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.fathername"
                          :label="$t('createHorse.nameOfFather')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 200) || $tc('createHorse.maxNcharacters', 200),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.fatherid"
                          :label="$t('createHorse.fathersFeifId')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 15) || $tc('createHorse.maxNcharacters', 15),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.fathersfathername"
                          :label="$t('createHorse.nameOfFathersFather')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 200) || $tc('createHorse.maxNcharacters', 200),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.fathersfatherid"
                          :label="$t('createHorse.fathersFatherId')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 15) || $tc('createHorse.maxNcharacters', 15),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.fathersmothername"
                          :label="$t('createHorse.nameOfFathersMother')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 200) || $tc('createHorse.maxNcharacters', 200),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.fathersmotherid"
                          :label="$t('createHorse.fathersMotherId')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 15) || $tc('createHorse.maxNcharacters', 15),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="text-weight-medium section">{{ $t("createHorse.ancestryMotherLine") }}</div>

                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.mothername"
                          :label="$t('createHorse.nameOfMother')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 200) || $tc('createHorse.maxNcharacters', 200),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.motherid"
                          :label="$t('createHorse.mothersFeifId')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 15) || $tc('createHorse.maxNcharacters', 15),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.mothersfathername"
                          :label="$t('createHorse.nameOfMothersFather')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 200) || $tc('createHorse.maxNcharacters', 200),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.mothersfatherid"
                          :label="$t('createHorse.mothersFatherFeifId')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 15) || $tc('createHorse.maxNcharacters', 15),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.mothersmothername"
                          :label="$t('createHorse.nameOfMothersMother')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 200) || $tc('createHorse.maxNcharacters', 200),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.mothersmotherid"
                          :label="$t('createHorse.mothersMotherFeifId')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 15) || $tc('createHorse.maxNcharacters', 15),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="text-weight-medium section">{{ $t("createHorse.description") }}</div>
                  <div class="row">
                    <div class="col-12 col-sm-12">
                      <div class="q-pa-md">
                        <q-input
                          :disable="!validFeifId"
                          clearable
                          clear-icon="close"
                          v-model="newHorse.tagline"
                          :label="`${$t('createHorse.tagline')} (${newHorse.tagline.length}/55)`"
                          :hint="$t('createHorse.taglineHint')"
                          lazy-rules
                          :rules="[
                            (val) => isNullOrLessThanNcharacter(val, 55) || $tc('createHorse.maxNcharacters', 55),
                          ]"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-sm-12">
                      <div class="q-pa-md">
                        <q-editor
                          ref="editor_ref"
                          @paste.native="(evt) => pasteCapture(evt)"
                          :disable="!validFeifId"
                          v-model="newHorse.description"
                          min-height="15rem"
                          :toolbar="editorToolbar()"
                        >
                          <template v-slot:showCharCount>
                            <small class="q-editor__toolbar-group">{{ newHorse.description.length }}/4000</small>
                          </template>
                        </q-editor>
                      </div>

                      <q-banner
                        rounded
                        class="q-mt-xs text-white bg-negative"
                        v-if="newHorse.description.length > 4000"
                        >{{
                          $t("createHorse.textExceededMaxLength", {
                            maxLength: 4000,
                            actualLength: newHorse.description.length,
                          })
                        }}</q-banner
                      >
                    </div>
                  </div>
                  <div class="text-weight-medium section">{{ $t("createHorse.media") }}</div>
                  <div class="row">
                    <div class="col-12 col-sm-12">
                      <div class="q-pa-md">
                        <image-handler
                          :feifId="newHorse.feifId"
                          :horseId="newHorse.id"
                          :imageUrls="newHorse.imageUrls"
                          :disable="!validFeifId"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12 col-sm-12">
                      <div class="q-pa-md">
                        <video-handler
                          :feifId="newHorse.feifId"
                          :horseId="newHorse.id"
                          :videoUrls="newHorse.videoUrls"
                          :disable="!validFeifId"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- <div class="text-weight-medium section">{{ $t('createHorse.status') }}</div> -->
                  <div class="row justify-center">
                    <div class="col-md-6 col-sm-8 col-xs-11">
                      <div class="q-pa-md">
                        <q-select
                          :disable="!validFeifId"
                          v-model="newHorse.status"
                          :options="getStatusMap()"
                          option-value="index"
                          option-label="value"
                          emit-value
                          map-options
                          :label="$t('createHorse.status')"
                          color="gangHorseBlue"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-separator dark />

            <q-card-actions align="center">
              <q-btn type="submit" :disable="!validInput" flat color="gangHorseBlue" :label="$t('createHorse.save')" />
            </q-card-actions>
          </q-form>
        </q-card>
        <div v-else>{{ $t("general.youAreNotLogedIn") }}</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import { worldfengurFindById, horseCreate } from "./../helpers/apiService";

import LocationInput from "../components/LocationInput.vue";
import ImageHandler from "../components/ImageHandler.vue";
import VideoHandler from "../components/VideoHandler.vue";
const feifIdRegex = /^[a-zA-Z]{2}[0-9]{10}$/gm;

export default {
  name: "createHorse",
  components: { LocationInput, ImageHandler, VideoHandler },
  data() {
    // const startHorse =
    return {
      newHorse: this.getDefaultHorse(),
      loadingWorldFengurInfo: false,
      serverRejectedFeifId: false,
      inputpriceFixed: "",
      inputpriceRangeMin: "",
      inputpriceRangeMax: "",
      showPriceRange: true,

      location: null,
      inEditMode: false, // new horse or edit existing?
      loadingStateProgress: 0, // value von 0 - 100
    };
  },
  watch: {
    inputpriceFixed: function (newValue) {
      this.newHorse.priceMin = parseInt(newValue);
      this.newHorse.priceMax = parseInt(newValue);
    },
    inputpriceRangeMin: function (newValue) {
      this.newHorse.priceMin = parseInt(newValue);
      this.$refs.priceRangeMaxInput.resetValidation();
    },
    inputpriceRangeMax: function (newValue) {
      this.newHorse.priceMax = parseInt(newValue);
      this.$refs.priceRangeMinInput.resetValidation();
    },
    showPriceRange: function (newValue) {
      if (newValue) {
        this.inputpriceRangeMin = "0";
        this.inputpriceRangeMax = "0";
      }
    },
  },
  methods: {
    ...mapActions("horseStore", ["setSingleHorse", "createHorse", "updateHorse", "fetchHorseById"]),
    clearData() {
      this.newHorse = this.getDefaultHorse();
    },

    async onFeifIdInput() {
      this.serverRejectedFeifId = false;
      if (this.validInput) {
        this.loadingWorldFengurInfo = true;

        this.loadingStateProgress = 0;
        const expectedLoadingTime = 10000;
        const updateIntervalTime = 500;

        let updateInterval = setInterval(() => {
          console.log("update progress");
          if (this.loadingStateProgress < 1) {
            this.loadingStateProgress += (updateIntervalTime / expectedLoadingTime) * 2;
          }
        }, updateIntervalTime);

        try {
          const wfHorse = await worldfengurFindById(this.newHorse.feifId);
          const horse = await horseCreate(wfHorse);

          console.debug("created horse: ", horse);
          delete horse.gender;
          delete horse.height;
          delete horse.color;

          Object.assign(this.newHorse, horse);
          // update if mare
          if (horse.sexInWorldfengur == 2) {
            this.newHorse.gender = 0;
          }
        } catch (error) {
          console.error(error);
          this.serverRejectedFeifId = true;
        } finally {
          clearInterval(updateInterval);
        }

        this.loadingWorldFengurInfo = false;
      }
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

    saveHorse() {
      this.updateHorse(this.newHorse)
        .then((result) => {
          //console.debug("upload result :", horse);

          this.$q.notify({
            message: result.success
              ? this.$t("createHorse.updateHorseSuccess")
              : this.$t("createHorse.updateHorseFail"),
            color: result.success ? "positive" : "negative",
          });
        })
        .catch((error) => {
          console.error("upload result :", error);
        });
    },

    getDefaultHorse() {
      const defaultHorse = {
        tagline: "",
        description: `<i>${this.$t("createHorse.descriptionHint")}</i>`,
        feifId: "",
        currency: 0,
        locationId: null,
        imageUrls: [],
        videoUrls: [],
        hasEczema: null,
        status: 0,
      };
      return defaultHorse;
    },
    isNullOrLessThanNcharacter(value, maxCharacters) {
      if (value) {
        return value.length <= maxCharacters;
      }
      return true;
    },
  },
  computed: {
    ...mapGetters({
      horseById: "horseStore/horseById",
    }),
    ...mapGetters("userStore", ["isLoggedIn"]),
    validFeifId() {
      return this.newHorse.feifId && this.newHorse.feifId.match(feifIdRegex);
    },
    validInput() {
      return this.validFeifId;
    },
  },
  async mounted() {
    if (this.$route.params.horseId) {
      await this.fetchHorseById(this.$route.params.horseId);
      var horse = this.horseById(this.$route.params.horseId);

      this.$set(this, "newHorse", JSON.parse(JSON.stringify(horse)));
      // this.newHorse = JSON.parse(JSON.stringify(horse));
      if (horse.priceMin == horse.priceMax) {
        this.inputpriceFixed = horse.priceMin;
        this.showPriceRange = false;
      } else {
        this.inputpriceRangeMin = horse.priceMin;
        this.inputpriceRangeMax = horse.priceMax;
        this.showPriceRange = true;
      }

      this.location = horse.location;

      this.inEditMode = true;
      console.debug("horseToEdit");
    } else {
      console.debug("regular horse creation");
    }
  },
};
</script>
<style lang="scss" scoped>
.groupBoxTitle {
  position: relative;
  top: -1.2em;
  margin-left: 1em;
  display: inline;
}
</style>
