<template>
  <article>
    <q-card flat>
      <q-card-section>
        <q-banner
          class="banner"
          style="border-radius: 5px 5px 0px 0px"
          @click="openHorseDetails"
          inline-actions
        >
          {{ horse.tagline }}
          <template v-slot:action>
            <!-- <q-btn v-if="horse.videoUrls.length" dense flat round icon="videocam" color="grey" aria-label="Has video"></q-btn> -->
            <q-icon
              v-if="horse.videoUrls.length"
              name="videocam"
              color="grey"
              style="font-size: 2em"
            />

            <!-- <q-icon v-if="horse.messageCount" name="message" color="grey" style="font-size:1.8em;">
              <q-badge color="gangHorseBlue" transparent floating>{{horse.messageCount }}</q-badge>
            </q-icon> -->

            <q-btn
              v-if="horse.messageCount"
              dense
              flat
              round
              icon="message"
              color="grey"
              :aria-label="'Has ' + horse.messageCount + ' messages'"
            >
              <q-badge color="gangHorseBlue" transparent floating>{{
                horse.messageCount
              }}</q-badge>
            </q-btn>

            <q-btn
              v-if="isLoggedIn"
              dense
              flat
              round
              color="positive"
              :icon="isHorseFavorite(horse) ? 'favorite' : 'favorite_border'"
              @click="setAsFavorite"
            />            
          </template>
        </q-banner>
        <div style="margin: 0px 0px 0px 0px">
          <q-responsive
            :ratio="carouselRatio()"
            style="width: 800px; max-width: 100%"
          >
            <q-carousel
              v-model="slide"
              animated
              swipeable
              :arrows="images.length >= 1"
              :navigation="images.length >= 1"
              infinite
              height="15rem"
            >
              <!-- :img-src="index == slide ? image.url : ''" -->
              <q-carousel-slide
                v-for="(image, index) in images"
                :key="index + id"
                :name="index"
                :img-src="image.thumbUrl || image.url"
                @click="openHorseDetails"
                style="cursor: pointer"
                control-color="blue-grey-7"
                role="img"
                :title="$t('general.islandicHorse') +': ' + horse.name"
                :alt="$t('general.islandicHorse') +': ' + horse.name + ' Bild ' + slide"
              >
                <div v-if="false" class="absolute-bottom">
                  <div class="text-subtitle1 text-white">
                    {{ image.thumbUrl }}
                  </div>
                </div>
              </q-carousel-slide>

              <q-carousel-slide
                :name="images.length"
                style="padding: 0"
                @click="openHorseDetails"
              >
                <HorseMap
                  v-if="horse.location"
                  :horses="[horse]"
                  class="bg-grey-5 q-pt-sm"
                />
              </q-carousel-slide>
            </q-carousel>
          </q-responsive>
        </div>
        <q-banner
          class="banner"
          style="border-radius: 0px 0px 5px 5px; height: 8.2rem"
          @click="openHorseDetails"
        >
          <div class="row q-mb-sm">
            <div class="col-6">{{ getGender(horse.gender) }}</div>
            <div class="col-6">
              {{ horse.yearOfBirth }} ({{ currentYear - horse.yearOfBirth }}
              {{ $t("search.years") }})
            </div>
          </div>

          <div class="row q-mb-sm">
            <div class="col-6">{{ horse.height.toFixed(2) }}</div>
            <div class="col-6">{{ getFurColor(horse.color) }}</div>
          </div>

          <div class="row q-mb-smd">
            <!-- <div class="col-6" v-if="horse.price > 0">
            {{ horse.price | toCurrency(getCurrency(horse.currency)) }}
            <span
              class="text-weight-light"
              v-if="showDifferentPrice"
            >(~{{ getUserPrice.amount | toCurrency(getCurrency(getUserPrice.currency)) }})</span>
            </div>-->

            <div class="col-6" v-if="horse.priceMin == horse.priceMax">
              {{ horse.priceMin | toCurrency(getCurrency(horse.currency)) }}
              <br />
              <small class="text-weight-light" v-if="showDifferentPrice"
                >(~{{
                  getUserPriceMin.priceMin.amount
                    | toCurrency(
                      getCurrency(getUserPriceMin.priceMin.currency)
                    )
                }})</small
              >
            </div>

            <div class="col-6" v-else>
              {{ horse.priceMin | toCurrencyNoSymbol() }} -
              {{ horse.priceMax | toCurrency(getCurrency(horse.currency)) }}
              <br />
              <small class="text-weight-light" v-if="showDifferentPrice"
                >(~
                {{ getUserPriceMin.priceMin.amount | toCurrencyNoSymbol() }} -
                {{
                  getUserPriceMin.priceMax.amount
                    | toCurrency(
                      getCurrency(getUserPriceMax.priceMax.currency)
                    )
                }})</small
              >
            </div>

            <div class="col-6" v-if="horse.location">
              {{ formatLocation(horse.location, true) }}
            </div>
          </div>
        </q-banner>
      </q-card-section>
    </q-card>
  </article>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import HorseMap from "./HorseMap.vue";

export default {
  name: "HorseSummaryCard",
  components: { HorseMap },
  props: {
    horse: {
      type: Object,
    },
  },
  data() {
    return {
      slide: 0,
      currentYear: new Date().getFullYear(),
      id: Math.random().toString(36).substring(2, 15),
    };
  },
  methods: {
    ...mapActions("favoritesStore", ["toggleFavorite"]),
    openHorseDetails() {
      this.$router
        .push({
          name: "horseDetail",
          params: {
            horseId: this.horse.id,
          },
        })
        .catch((err) => {});
    },
    setAsFavorite(event) {
      event.stopPropagation();
      this.toggleFavorite(this.horse);
    },
  },
  computed: {
    ...mapGetters("favoritesStore", ["isHorseFavorite"]),
    ...mapGetters("userStore", ["isLoggedIn", "userCurrency"]),
    images() {
      var images = Array.from(this.horse.imageUrls);
      return images.sort((a, b) => {
        if (a.mainImage) return -1;
        if (b.mainImage) return 1;
        return 0;
      });
    },
    getUserPriceMin() {
      return this.horse.otherPrices.find(
        (x) => x.priceMin.currency.toString() === this.userCurrency
      );
    },
    getUserPriceMax() {
      return this.horse.otherPrices.find(
        (x) => x.priceMax.currency.toString() === this.userCurrency
      );
    },
    showDifferentPrice() {
      if (this.horse.currency.toString() === this.userCurrency) return false;

      if (this.horse.otherPrices && this.horse.otherPrices.length > 0) {
        return (
          this.getUserPriceMin !== undefined ||
          this.getUserPriceMax !== undefined
        );
      }
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
.banner {
  background-color: $grey-3;
  cursor: pointer;
}
</style>