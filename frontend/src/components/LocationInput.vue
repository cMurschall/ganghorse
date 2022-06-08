<template>
  <div>
    <q-select
      v-model="locationSelectModel"
      :disable="disable"
      :use-input="locationSelectModel == null"
      input-debounce="100"
      @filter="filterLocationFn"
      @input="$emit('select', $event)"
      :options="locationSuggestions"
      use-chips
      color="gangHorseBlue"
      :label="$t('locationInput.label')"
      lazy-rules
      :rules="[
        (val) =>
          !(validate && locationSelectModel == null) ||
          $t('locationInput.validationErrorMessage'),
      ]"
    >
      <!-- country selection before the postalcode -->
      <template v-slot:prepend>
        <q-select
          color="gangHorseBlue"
          v-model="selectedCountryCode"
          :options="countryCodes()"
          borderless
          @input="setUserCountry"
        />
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
          <q-item-section>
            <!-- {{scope.opt.postalcode}} - {{scope.opt.placename}}, {{scope.opt.admincode1}} -->
            <q-item-label
              >{{ scope.opt.postalcode }} - {{ scope.opt.placename }},
              {{ scope.opt.admin1code }}</q-item-label
            >
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:selected-item="scope">
        <q-chip
          removable
          @remove="scope.removeAtIndex(scope.index)"
          :tabindex="scope.tabindex"
          class="q-ma-none"
        >
          <q-avatar
            color="gangHorseBlue"
            text-color="white"
            icon="my_location"
          />
          {{ scope.opt.placename }}, {{ scope.opt.admin1code }}
        </q-chip>
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import { locationFindByPostalcode } from "./../helpers/apiService";

export default {
  name: "LocationInput",
  data() {
    return {
      selectedCountryCode: "",
      locationSelectModel: null,
      postalCodeInput: null,

      locationSuggestions: [],
      skipGetLocationQuery: true,

      inputEnabled: true,
    };
  },
  props: {
    disable: {
      type: Boolean,
      default: false,
    },
    validate: {
      type: Boolean,
      default: false,
    },
    initalLocation: {
      type: Object,
      default: null,
      required: false,
    },
  },
  watch: {
    initalLocation: function (newValue) {
      this.locationSelectModel = newValue;
    },
  },

  methods: {
    filterLocationFn(val, update, abort) {
      const lengths = new Map([
        ["DE", 4],
        ["CH", 3],
        ["AT", 3],
        ["DK", 3],
        ["SE", 3],
      ]);

      const startSearchLength = lengths.get(this.selectedCountryCode) || 3;

      if (val.length < startSearchLength) {
        abort();
        return;
      }

      console.log("startSearchLength", startSearchLength);

      locationFindByPostalcode({
        postalCode: val.toString(),
        countryCode: this.selectedCountryCode,
      }).then((response) => {
        if (response) {
          this.locationSuggestions = response;
        }
        update(() => {
          this.postalCodeInput = val;
        });
      });
    },
    setUserCountry(event) {
      localStorage.setItem("userCountry", event);
    },
  },
  mounted() {
    this.selectedCountryCode =
      localStorage.getItem("userCountry") || this.countryCodes()[0];
  },
};
</script>

<style>
</style>