<template>
  <q-page padding>
    <script v-html="jsonld" type="application/ld+json"></script>

    <div class="row justify-center">
      <div class="col-12 col-sm-12">
        <div class="row logo">
          <div class="col-6">
            <h1 class="logoFont claim">{{ $t("general.pageClaim") }}</h1>
          </div>
          <div class="col-6">
            <img class="logoImage" src="~assets/Logo.svg" alt="Logo finde dein Pferd" />
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-12">
        <q-card>
          <q-card class="bg-grey-3">
            <div class="q-pa-md">
              <q-expansion-item
                v-model="detailSearchExpanded"
                expand-separator
                color="gangHorseBlue"
                class="full-width"
                icon="search"
                :label="detailSearchExpanded ? $t('search.detailSearchCollapse') : $t('search.detailSearchExpand')"
                header-class="bg-gangHorseBlue text-white"
                :duration="500"
              >
                <div class="row">
                  <div class="col-md-4 col-sm-6 col-xs-12 q-pa-md">
                    <q-checkbox
                      v-model="seachRange.includeMares"
                      color="gangHorseBlue"
                      :disable="onlyOneGenderSelected && seachRange.includeMares"
                      @input="updateHorses"
                      :label="$tc('general.mare', 0)"
                    />
                    <q-checkbox
                      v-model="seachRange.includeGeldings"
                      color="gangHorseBlue"
                      :disable="onlyOneGenderSelected && seachRange.includeGeldings"
                      @input="updateHorses"
                      :label="$tc('general.gelding', 0)"
                    />
                    <q-checkbox
                      v-model="seachRange.includeStallions"
                      color="gangHorseBlue"
                      :disable="onlyOneGenderSelected && seachRange.includeStallions"
                      @input="updateHorses"
                      :label="$tc('general.stallion', 0)"
                    />
                  </div>

                  <div class="col-md-4 col-sm-6 col-xs-12 q-pa-md">
                    <q-range
                      v-model="seachRange.yearOfBirthModel"
                      :min="ageRangeMin"
                      :max="ageRangeMax"
                      :step="1"
                      :decimals="1"
                      label
                      color="gangHorseBlue"
                      :left-label-value="currentYear - seachRange.yearOfBirthModel.min + $t('search.years')"
                      :right-label-value="currentYear - seachRange.yearOfBirthModel.max + $t('search.years')"
                      @change="updateHorses"
                    />
                    <q-badge color="gangHorseBlue">{{
                      $t("search.yearFromTo", {
                        min: seachRange.yearOfBirthModel.min,
                        max: seachRange.yearOfBirthModel.max,
                      })
                    }}</q-badge>
                  </div>
                  <div class="col-md-4 col-sm-6 col-xs-12 q-pa-md">
                    <q-range
                      v-model="seachRange.priceModel"
                      :min="priceRangeMin"
                      :max="priceRangeMax"
                      :step="100"
                      label
                      color="gangHorseBlue"
                      :left-label-value="seachRange.priceModel.min | toCurrency(getCurrency(userCurrency))"
                      :right-label-value="seachRange.priceModel.max | toCurrency(getCurrency(userCurrency))"
                      @change="updateHorses"
                    />
                    <q-badge color="gangHorseBlue">{{
                      $t("search.priceFromTo", {
                        min: seachRange.priceModel.min,
                        max: seachRange.priceModel.max,
                        currency: getCurrency(userCurrency),
                      })
                    }}</q-badge>
                  </div>

                  <div class="col-md-4 col-sm-6 col-xs-12 q-pa-md">
                    <location-input @select="updateLocation" :initalLocation="selectedLocation" />

                    <div class="row" v-if="seachRange.locationSelectModel">
                      <div class="col-xs-12 col-sm-12 col-md-10">
                        <q-slider
                          v-model="seachRange.searchRadius"
                          :min="0"
                          :max="1000"
                          :step="20"
                          :decimals="1"
                          color="gangHorseBlue"
                          @change="updateHorses"
                        />
                        <q-badge color="gangHorseBlue">{{
                          $t("search.radius", {
                            radius: seachRange.searchRadius,
                          })
                        }}</q-badge>
                      </div>
                      <div class="col-xs-0 col-sm-0 col-md-2">
                        <locationSeachMap :location="selectedLocation" :seachRadius="seachRange.searchRadius" />
                      </div>
                    </div>
                  </div>

                  <div class="col-md-4 col-sm-6 col-xs-12 q-pa-md">
                    <q-select
                      v-model="seachRange.selctedColors"
                      multiple
                      use-chips
                      :options="colors"
                      color="gangHorseBlue"
                      option-value="value"
                      :label="$t('search.colors')"
                      @input="updateHorses"
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                          <q-item-section>
                            <q-item-label>{{ getFurColor(scope.opt) }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-icon name="check" v-show="seachRange.selctedColors.includes(scope.opt)" />
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:selected-item="scope">
                        <q-chip
                          removable
                          dense
                          @remove="scope.removeAtIndex(scope.index)"
                          :tabindex="scope.tabindex"
                          class="q-ma-none"
                          >{{ getFurColor(scope.opt) }}</q-chip
                        >
                      </template>
                    </q-select>
                  </div>

                  <div class="col-md-4 col-sm-6 col-xs-12 q-pa-md"></div>
                </div>
                <hr class="horizontalLine" />
                <div class="row justify-start">
                  <div class="q-pa-md">
                    <q-toggle color="gangHorseBlue" :label="$t('search.savedSearches')" v-model="showSavedSeaches" />
                  </div>

                  <div v-if="showSavedSeaches" class="col-md-4 col-sm-6 col-xs-12 q-pa-md">
                    <q-select
                      v-if="isLoggedIn"
                      v-model="selectedSearchRange"
                      :options="userSearches"
                      map-options
                      emit-value
                      :disable="!userSearches.length"
                      :label="$t('search.savedSearches')"
                      :hint="$t('search.selectSearch')"
                    >
                      <template v-slot:before>
                        <q-btn
                          color="gangHorseBlue"
                          outline
                          icon-right
                          :label="$t('search.saveSearch')"
                          icon="add"
                          :disable="!isSeachValueUnique(toApiSearchOptions(seachRange))"
                          @click="saveSearchDialogOpen = !saveSearchDialogOpen"
                        >
                          <q-dialog v-model="saveSearchDialogOpen">
                            <q-card style="min-width: 350px">
                              <q-card-section>
                                <div class="text-h6">
                                  {{ $t("search.saveSearch") }}
                                </div>
                              </q-card-section>

                              <q-card-section class="q-pt-none">
                                <q-input
                                  dense
                                  v-model="searchName"
                                  autofocus
                                  :label="$t('search.seachNameInputLabel')"
                                  :hint="$t('search.seachNameInputHint')"
                                  :rules="[(val) => isSearchNameUnique(val) || $t('search.searchNamenNotUnique')]"
                                  @keyup.enter="onSaveSearch"
                                />
                              </q-card-section>

                              <q-card-actions align="right" class="text-primary">
                                <q-btn flat v-close-popup :label="$t('general.cancel')" />
                                <q-btn flat v-close-popup :label="$t('createHorse.save')" @click="onSaveSearch" />
                              </q-card-actions>
                            </q-card>
                          </q-dialog>
                        </q-btn>
                      </template>

                      <!-- <template v-slot:no-option>
                        <q-item>
                          <q-item-section >No saved seach</q-item-section>
                        </q-item>
                      </template>-->

                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                          <q-item-section side>
                            <q-btn dense round flat @click="onDeleteSearch(scope.opt)" icon="delete_forever" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label @click="onNewSeachInput(scope.opt.value)">{{ scope.opt.label }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                    <div class="q-pa-sm" v-else>
                      {{ $t("general.youAreNotLogedIn") }}
                    </div>
                  </div>
                </div>
              </q-expansion-item>
            </div>
          </q-card>

          <q-infinite-scroll @load="onScrollLoad" :offset="250" :disable="!hasMorePages">
            <main class="horseContainer">
              <div v-for="horse in publicHorses" :key="horse.id">
                <HorseSummaryCard :horse="horse" />
              </div>
            </main>
            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <q-spinner-dots color="gangHorseBlue" size="3em" />
              </div>
            </template>
          </q-infinite-scroll>
        </q-card>
      </div>

      <div class="col-12 col-sm-12 q-mt-md">
        <q-card>
          <q-card-section class="bg-grey-3" v-if="false">
            <div class="text-h6">{{ $t("general.about.header") }}</div>
          </q-card-section>
          <q-card-section>
            <div class="row">
              <div class="col-md-6 offset-md-3">
                <div>
                  <div class="text-h6">
                    {{ $t("general.about.whatItIsHeader") }}
                  </div>
                  <p class="aboutDescription">
                    {{ $t("general.about.whatItIsContent") }}
                  </p>
                </div>

                <div>
                  <div class="text-h6">
                    {{ $t("general.about.howToPronounceHeader") }}
                  </div>
                  <p class="aboutDescription">
                    {{ $t("general.about.howToPronounceContent") }}
                  </p>
                </div>

                <div>
                  <div class="text-h6">
                    {{ $t("general.about.costsHeader") }}
                  </div>
                  <p class="aboutDescription">
                    {{ $t("general.about.costsContent") }}
                  </p>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import { debounce } from "quasar";

import { locationFindById } from "./../helpers/apiService";

import { paginationStep } from "./../store/horseStore";

import HorseSummaryCard from "./../components/HorseSummaryCard";
import LocationInput from "../components/LocationInput.vue";
import LocationSeachMap from "../components/LocationSeachMap.vue";

export default {
  name: "MainPage",
  components: { HorseSummaryCard, LocationInput, LocationSeachMap },
  data() {
    return {
      detailSearchExpanded: false,

      showSavedSeaches: false,
      saveSearchDialogOpen: false,
      selectedSearchRange: null,
      searchName: "",

      seachRange: {
        includeMares: true,
        includeGeldings: true,
        includeStallions: true,
        priceModel: {
          min: 0,
          max: 0,
        },
        yearOfBirthModel: {
          min: 0,
          max: 0,
        },
        locationSelectModel: null,
        searchRadius: null,

        selctedColors: [],
      },

      selectedLocation: null,

      currentYear: new Date().getFullYear(),

      pageIndex: 0,
    };
  },
  methods: {
    ...mapActions("horseStore", ["fetchRange", "fetchFilteredHorses"]),
    ...mapMutations("horseStore", ["setPagination", "resetPagination"]),
    ...mapActions("userStore", ["whoAmI", "fetchUserSearch", "addUserSearchToServer", "removeUserSearchFromServer"]),
    updateLocation(event) {
      console.debug(event);
      if (event && event.hasOwnProperty("id")) {
        this.seachRange.locationSelectModel = event.id;
        this.selectedLocation = event;
      } else {
        this.seachRange.locationSelectModel = null;
        this.selectedLocation = null;
      }
      this.updateHorses();
    },
    updateHorses() {
      // after update of input we need to reset pagination
      this.pageIndex = 0;
      this.resetPagination();

      this.fetchFilteredHorses({
        seachRange: this.toApiSearchOptions(this.seachRange),
        mode: "replace",
      });
    },
    async onScrollLoad(index, done) {
      if (this.horses && this.horses.length > 0 && this.hasMorePages) {
        this.pageIndex++;

        console.debug("need more horse items " + this.pageIndex);
        // await new Promise((r) => setTimeout(r, 5000));
        this.setPagination({
          skip: this.pageIndex * paginationStep,
          take: paginationStep,
        });
        await this.fetchFilteredHorses({
          seachRange: this.toApiSearchOptions(this.seachRange),
          mode: "append",
        });
      }
      done();
    },
    async onSaveSearch() {
      console.log("saving seach: ", this.toApiSearchOptions(this.seachRange));
      var searchToSave = {
        label: this.searchName,
        // make a deep copy
        value: JSON.parse(JSON.stringify(this.toApiSearchOptions(this.seachRange))),
      };
      await this.addUserSearchToServer(searchToSave);

      this.saveSearchDialogOpen = false;
      this.searchName = "";

      this.selectedSearchRange = searchToSave;
    },
    async onNewSeachInput(selectedUserSearch) {
      this.seachRange.includeMares = selectedUserSearch.includeMares;
      this.seachRange.includeGeldings = selectedUserSearch.includeGeldings;
      this.seachRange.includeStallions = selectedUserSearch.includeStallions;

      if (selectedUserSearch.location) {
        const locationId = selectedUserSearch.location.data.id;

        const location = await locationFindById(locationId);

        if (location) {
          this.selectedLocation = location;

          this.seachRange.searchRadius = selectedUserSearch.location.searchRadiusInKm;

          this.seachRange.locationSelectModel = locationId;
        }
      } else {
        this.selectedLocation = null;
        this.seachRange.searchRadius = null;
        this.seachRange.locationSelectModel = null;
      }
      if (selectedUserSearch.priceRangeCurrency) {
        this.seachRange.priceModel = selectedUserSearch.priceRangeCurrency.range;

        // currency todo
        // this.userCurrency = selectedUserSearch.priceRangeCurrency.currency
      }

      if (selectedUserSearch.ageRange) {
        this.seachRange.yearOfBirthModel = selectedUserSearch.ageRange;
      }

      if (selectedUserSearch.colors && selectedUserSearch.colors.length) {
        this.seachRange.selctedColors = selectedUserSearch.colors;
      }

      this.updateHorses();
    },
    async onDeleteSearch(event) {
      await this.removeUserSearchFromServer(event);

      if (this.objectsEqual(this.selectedSearchRange, event.value)) {
        this.selectedSearchRange = null;
      }
    },
    isSearchNameUnique(newName) {
      return this.userSearches.map((x) => x.label).indexOf(newName) === -1;
    },
    isSeachValueUnique(search) {
      const isSeachEqual = (a, b) => {
        return (
          a.includeMares === b.includeMares &&
          a.includeGeldings === b.includeGeldings &&
          a.includeStallions === b.includeStallions &&
          a.priceModel.min === b.priceModel.min &&
          a.priceModel.max === b.priceModel.max &&
          a.yearOfBirthModel.min === b.yearOfBirthModel.min &&
          a.yearOfBirthModel.max === b.yearOfBirthModel.max &&
          a.searchRadius === b.searchRadius
        );
      };

      const hasCurrentSeachInUserSeach = this.userSearches.some((x) => this.objectsEqual(x.value, search));
      const isEmpty = this.userSearches.length === 0;

      return !hasCurrentSeachInUserSeach || isEmpty;
    },
    toApiSearchOptions(seachRange) {
      // transform to an api seach range option object
      var options = {
        includeMares: seachRange.includeMares,
        includeGeldings: seachRange.includeGeldings,
        includeStallions: seachRange.includeStallions,
      };
      if (seachRange.searchRadius && seachRange.locationSelectModel) {
        options.location = {
          data: { id: seachRange.locationSelectModel },
          searchRadiusInKm: seachRange.searchRadius,
        };
      }
      if (seachRange.priceModel) {
        // options.priceRange = {
        //   min: seachRange.priceModel.min,
        //   max: seachRange.priceModel.max
        // }

        options.priceRangeCurrency = {
          range: {
            min: seachRange.priceModel.min,
            max: seachRange.priceModel.max,
          },
          currency: this.userCurrency,
        };
      }
      if (seachRange.yearOfBirthModel) {
        options.ageRange = {
          min: seachRange.yearOfBirthModel.min,
          max: seachRange.yearOfBirthModel.max,
        };
      }
      if (seachRange.selctedColors && seachRange.selctedColors.length > 0) {
        options.colors = seachRange.selctedColors;
      }

      return options;
    },
  },
  computed: {
    ...mapGetters({
      horses: "horseStore/horses",
      hasMorePages: "horseStore/hasMorePages",

      serverRange: "horseStore/serverRange",

      priceRangeMin: "horseStore/priceRangeMin",
      priceRangeMax: "horseStore/priceRangeMax",

      ageRangeMin: "horseStore/ageRangeMin",
      ageRangeMax: "horseStore/ageRangeMax",
      colors: "horseStore/colors",
      userCurrency: "userStore/userCurrency",
      userSearches: "userStore/userSearches",
      isLoggedIn: "userStore/isLoggedIn",
      userLang: "userStore/userLang",
    }),
    avaliableColors() {
      if (this.serverRange) {
        let colors = this.serverRange.colors;
        if (colors) {
          return colors.map((x) => {
            return {
              value: x,
              label: this.getFurColor(x),
            };
          });
        }
      }
    },
    onlyOneGenderSelected() {
      var selectedGender = [
        this.seachRange.includeMares,
        this.seachRange.includeGeldings,
        this.seachRange.includeStallions,
      ].filter((x) => x);
      return selectedGender.length == 1;
    },
    publicHorses() {
      return this.horses.filter((x) => x.status == 0);
    },
    jsonld() {
      const jsonld = {
        "@context": "http://schema.org",
        "@type": "WebSite",
        name: "gang horse",
        url: "https://gang.horse",
      };
      return jsonld;
    },
  },
  async created() {
    if (process.env.MODE === "spa") {
      this.fetchRange();
      await this.fetchUserSearch();

      this.seachRange.priceModel = this.serverRange.priceRange;
      this.seachRange.yearOfBirthModel = this.serverRange.ageRange;

      this.updateHorses = debounce(this.updateHorses, 400);
    }
  },
};
</script>

<style lang="scss" scoped>
.logo {
  .claim {
    transform: rotate(-4.2deg);
    text-align: center;
    padding: 1vw 0;
    font-size: 5vw;
  }
  .logoImage {
    // display: flex;
    // justify-content: center;
    // align-items: center;
    width: 100%;
    max-width: 20em;
    height: auto;
  }
}

.horseContainer {
  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(410px, 1fr));

  @media (max-width: $breakpoint-xs-max) {
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); // 320 px is the with of an iphone se
  }

  column-gap: 1em;
  row-gap: 1em;
}
.horizontalLine {
  border-top: 0.5px solid $gangHorseBlue;
}

.aboutDescription {
  white-space: pre-line;
}
</style>
