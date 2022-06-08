<template>
  <q-page padding>
    <script v-html="jsonld" type="application/ld+json"></script>
    <div v-if="horse">
      <!-- <script v-html="jsonldData" type="application/ld+json"></script> -->
      <div class="row justify-center q-col-gutter-xs" id="horseDetail">
        <div class="col-12 col-sm-10 col-md-6">
          <main>
            <q-card>
              <q-card-section>
                <header>
                  <h1 class="text-h5">{{ horse.tagline }}</h1>
                </header>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <article>
                  <div>
                    <div class="row">
                      <div class="col-12 col-sm-6">
                        <div class="q-pa-md">
                          <div class="heading">
                            {{ $t("horseDetail.horseName") }}
                          </div>
                          <div class="value">{{ horse.name }}</div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="q-pa-md">
                          <div class="heading">
                            {{ $t("horseDetail.horseFeifId") }}
                          </div>
                          <div class="value">{{ horse.feifId }}</div>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12 col-sm-6">
                        <div class="q-pa-md">
                          <div class="heading">
                            {{ $t("horseDetail.horseYearOfBirth") }}
                          </div>
                          <div class="value">{{ horse.yearOfBirth }}</div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="q-pa-md">
                          <div class="heading">
                            {{ $t("horseDetail.horseGender") }}
                          </div>
                          <div class="value">{{ getGender(horse.gender) }}</div>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12 col-sm-6">
                        <div class="q-pa-md">
                          <div class="heading">
                            {{ $t("horseDetail.horseHeight") }}
                          </div>
                          <div class="value">
                            {{
                              horse.height.toLocaleString($i18n.locale, {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="q-pa-md">
                          <div class="heading">
                            {{ $t("horseDetail.horseFurColor") }}
                          </div>
                          <div class="value">
                            {{ getFurColor(horse.color) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12 col-sm-6">
                        <div class="q-pa-md">
                          <div class="heading">
                            {{ $t("horseDetail.sweetItch") }}
                          </div>

                          <div class="value">
                            {{ horse.hasEczema ? $t("general.yes") : $t("general.no") }}
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="q-pa-md">
                          <div class="heading">
                            {{ $t("horseDetail.horsePrice") }}
                          </div>
                          <div v-if="horse.priceMin == horse.priceMax" class="value">
                            {{ horse.priceMin | toCurrency(getCurrency(horse.currency)) }}
                          </div>

                          <div v-else class="value">
                            {{ horse.priceMin | toCurrencyNoSymbol() }} -
                            {{ horse.priceMax | toCurrency(getCurrency(horse.currency)) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row" v-if="horse.imageUrls.length">
                      <div class="col-12 col-sm-12">
                        <div class="q-pa-xs">
                          <q-responsive :ratio="carouselRatio()" style="max-width: 100%">
                            <q-carousel
                              ref="imageCarousel"
                              v-model="imageSlide"
                              :arrows="horse.imageUrls.length > 1"
                              :navigation="horse.imageUrls.length > 1"
                              animated
                              infinite
                              swipeable
                              :fullscreen.sync="fullscreen"
                              navigation-icon="radio_button_unchecked"
                              control-type="unelevated"
                              control-color="white"
                              :control-text-color="fullscreen ? 'black' : 'blue-grey-7'"
                              class="carousel"
                              :title="$t('general.islandicHorse') + ': ' + horse.name"
                              role="img"
                              :alt="$t('general.islandicHorse') + ': ' + horse.name + ' Bild ' + (imageSlide + 1)"
                            >
                              <q-carousel-slide
                                v-for="(image, index) in horse.imageUrls"
                                :key="'url' + index"
                                :name="index"
                                class="slide"
                              >
                                <q-img :src="image.url" class="backgroundImage" contain />
                              </q-carousel-slide>

                              <template v-slot:control>
                                <q-carousel-control position="bottom-right" :offset="[3, 3]">
                                  <q-btn
                                    unelevated
                                    round
                                    dense
                                    color="white"
                                    :text-color="fullscreen ? 'black' : 'blue-grey-7'"
                                    :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                                    @click="fullscreen = !fullscreen"
                                  />
                                </q-carousel-control>
                              </template>
                            </q-carousel>
                          </q-responsive>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12 col-sm-12">
                        <div class="q-pa-md">
                          <div v-html="horse.description"></div>
                        </div>
                      </div>
                    </div>

                    <div class="row" v-if="horse.videoUrls.length">
                      <div class="col-12 col-sm-12">
                        <div>
                          <div class="q-pa-md" v-for="(video, index) in videos" :key="'video' + index">
                            <div v-if="video.youtubeLink.length">
                              <q-video v-if="youtubeConsent" :ratio="16 / 9" :src="video.youtubeLink" />
                              <div v-else>
                                <q-img
                                  :src="youtubeThumbNail(video.youtubeLink)"
                                  spinner-color="white"
                                  class="rounded-borders youtubeContainer"
                                  :alt="horse.name + 'video'"
                                >
                                  <div class="absolute-bottom text-subtitle1 text-center">
                                    <p class="text-body2">
                                      {{ $t("horseDetail.consentDetail") }}
                                    </p>
                                    <q-toggle
                                      v-model="youtubeConsent"
                                      :label="$t('horseDetail.showYoutubeContent')"
                                      class="text-body2"
                                    />
                                    <!-- Um externe Multimedia-Inhalte sehen zu können, ist einmalig Ihre Zustimmung erforderlich. 
                                Bitte beachten Sie unsere Informationen, auch zu eingesetzten Cookies
                                  und Ihren Wahlmöglichkeiten, in unserer Datenschutzerklärung.-->
                                    <div>
                                      <q-btn
                                        type="a"
                                        target="_blank"
                                        href="https://policies.google.com/privacy?hl=en-US"
                                        label="Google Privacy &amp; Terms"
                                        outline
                                        color="white"
                                        class="text-body2"
                                        size="sm"
                                      />
                                    </div>
                                  </div>
                                </q-img>
                              </div>
                            </div>

                            <q-media-player
                              v-else
                              type="video"
                              :sources="toVideoSources(video)"
                              :poster="toAwsUrl(video.posterUrl)"
                            ></q-media-player>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12 col-sm-12">
                        <div class="q-pa-md">
                          <pedigree :horseData="getPedigree(horse)" />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </q-card-section>
            </q-card>
          </main>
          <div class="q-mt-sm">
            <OtherHorsesCarusel :owner="horse.owner" :exeptionId="horse.id" />
          </div>
        </div>

        <div class="col-12 col-sm-10 col-md-4">
          <div class="row">
            <div class="col-12">
              <q-card>
                <q-card-section>
                  <div class="text-h5">{{ $t("horseDetail.contact") }}</div>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div class="text-weight-medium section">
                    {{ $t("horseDetail.sellerDetails") }}
                  </div>
                  <q-item>
                    <q-item-section v-if="false" avatar>
                      <q-avatar>
                        <img v-if="horse.owner.avatarUrl" :src="horse.owner.avatarUrl" />
                        <q-icon v-else name="face" />
                      </q-avatar>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ horse.owner.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-card-section>

                <q-card-section>
                  <div class="text-weight-medium section">
                    {{ $t("horseDetail.sellerDescription") }}
                  </div>
                  <q-item>
                    <q-item-section>
                      <div v-html="horse.owner.publicDescription" />
                      <!-- <q-item-label>{{ horse.owner.email }}</q-item-label> -->
                    </q-item-section>
                  </q-item>
                </q-card-section>

                <q-card-actions align="right" v-if="false">
                  <q-btn
                    flat
                    color="gangHorseBlue"
                    :label="$t('horseDetail.moreHorsesOfUser')"
                    @click="showMoreOfSeller"
                  />
                </q-card-actions>
              </q-card>
            </div>

            <div class="col-12 q-mt-sm" v-if="horse.location">
              <q-card>
                <q-card-section>
                  <div class="text-h5">
                    {{ $t("horseDetail.horseLocation") }}
                  </div>
                </q-card-section>
                <q-separator />

                <q-card-section>
                  <div class="q-pa-sm">
                    <div class="value">
                      {{ formatLocation(horse.location) }}
                    </div>
                  </div>
                  <HorseMap :horses="[horse]" />
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 q-mt-sm">
              <PublicMessageInput
                :horse="horse"
                @focus="keyboadModeEnabled = false"
                @blur="keyboadModeEnabled = true"
              />
            </div>

            <div class="col-12 q-mt-sm" v-if="horse.owner.id !== currentUser.id">
              <PrivateMessageInput
                :horse="horse"
                @focus="keyboadModeEnabled = false"
                @blur="keyboadModeEnabled = true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="loadFail">
      <div class="row">
        <div class="col-10">
          <q-card class="loadFail bg-negative text-white" flat bordered>
            <q-card-section>
              <q-card-section>
                <div class="text-h6">{{ $t("horseDetail.loadFail") }}</div>
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <div v-else>
      <q-inner-loading :showing="!loadFail">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>
</template>


<script>
import { throttle } from "quasar";
import { mapGetters, mapActions } from "vuex";
import { apiBaseUrl } from "./../helpers/apiService";

import Pedigree from "./../components/Pedigree";
import HorseMap from "./../components/HorseMap";
import OtherHorsesCarusel from "./../components/OtherHorsesCarusel";
import PrivateMessageInput from "./../components/PrivateMessageInput";
import PublicMessageInput from "./../components/PublicMessageInput";

export default {
  name: "HorseDetailPage",
  components: {
    Pedigree,
    HorseMap,
    PrivateMessageInput,
    PublicMessageInput,
    OtherHorsesCarusel,
  },
  meta() {
    return {
      title: this.htmlTitle,

      meta: {
        ogType: { name: "og:type", content: "article" },
        ...this.createMetaTitle(this.htmlTitle),
        ...this.createMetaDescription(this.htmlDescription),
        ...this.createMetaImage(this.htmlImage),
        ...this.createSpecificMetaUrl(`/horse/${this.horse.id}`),
      },
      link: {
        canonical: {
          rel: "canonical",
          href: `https://gang.horse/horse/${this.horse.id}}`,
        },
      },
    };
  },
  data() {
    return {
      imageSlide: 0,
      fullscreen: false,
      videoSlide: 0,
      loadFail: false,

      keyboadModeEnabled: true,
    };
  },
  methods: {
    // ...mapActions("horseStore", ["fetchHorseById"]),
    // ...mapActions("messageStore", ["getMessagesByTopic"]),
    getPedigree(horse) {
      var p = {
        id: horse.feifId,
        name_and_origin: horse.name,
        isRoot: true,
        parents: [
          {
            id: horse.fatherid,
            name_and_origin: horse.fathername,
            isRoot: false,
            parents: [
              {
                id: horse.fathersfatherid,
                name_and_origin: horse.fathersfathername,
                isRoot: false,
                parents: [],
              },
              {
                id: horse.fathersmotherid,
                name_and_origin: horse.fathersmothername,
                isRoot: false,
                parents: [],
              },
            ],
          },
          {
            id: horse.motherid,
            name_and_origin: horse.mothername,
            isRoot: false,
            parents: [
              {
                id: horse.mothersfatherid,
                name_and_origin: horse.mothersfathername,
                isRoot: false,
                parents: [],
              },
              {
                id: horse.mothersmotherid,
                name_and_origin: horse.mothersmothername,
                isRoot: false,
                parents: [],
              },
            ],
          },
        ],
      };
      return p;
    },
    showMoreOfSeller() {
      this.$router
        .push({
          name: "usersHorses",
          params: {
            userId: this.horse.owner.id,
          },
        })
        .catch((err) => {});
    },
    toVideoSources(video) {
      return [
        {
          src: this.toAwsUrl(video.videoUrlMp4),
          type: "video/mp4",
        },
      ];
    },
    youtubeThumbNail(youtubeUrl) {
      const regex = /embed\/(?<videoId>.+)$/gm;
      const youtubeVideoKey = regex.exec(youtubeUrl)?.groups?.videoId || "";
      return `${apiBaseUrl}video/youtubeThumbnail/${youtubeVideoKey}`;
    },
  },
  computed: {
    ...mapGetters({
      horseDetail: "horseStore/horseById",
      isLoggedIn: "userStore/isLoggedIn",
      currentUser: "userStore/currentUser",
    }),
    horse() {
      return this.horseDetail(this.$route.params.horseId);
    },
    horseImages() {
      return this.horse ? (horse.imageUrls[0] ? horse.imageUrls.map((x) => x.url) : []) : [];
    },
    videos() {
      return this.horse.videoUrls.filter((x) => (x.videoUrlMp4 || x.youtubeLink) && x.status === 3);
    },
    jsonldPrice() {
      if (this.horse.priceMin == this.horse.priceMax) {
        return {
          price: this.horse.priceMin,
        };
      }
      return {
        lowPrice: this.horse.priceMin,
        highPrice: this.horse.priceMax,
      };
    },
    jsonldImage() {
      if (!this.horse.imageUrls.length) {
        console.log("no image jsonldImage");
        return null;
      }
      var images = this.horse.imageUrls.map((x) => {
        return x.url;
      });

      return images;
    },
    jsonld() {
      if (this.horse) {
        return {
          "@type": "Product",
          "@context": "http://schema.org",
          url: `https://gang.horse/horseDetail/${this.horse.id}`,
          name: this.horse.name,
          image: this.jsonldImage,
          description: this.horse.tagline,
          brand: this.horse.owner.name,
          color: this.getFurColor(this.horse.color),
          category: this.$t("general.islandicHorse"),
          logo: "https://gang.horse/logoSquare.png",
          offers: {
            "@type": "Offer",
            availability: "InStock",
            priceSpecification: {
              "@type": "PriceSpecification",
              eligibleQuantity: 1,
              priceCurrency: this.getCurrency(this.horse.currency),
              ...this.jsonldPrice,
            },
          },
        };
      } else {
        return {};
      }
    },
    youtubeConsent: {
      get() {
        return this.$store.getters["userStore/externalConsent"];
      },
      set(value) {
        this.$store.commit("userStore/setExternalContentConsent", value);
      },
    },

    htmlTitle() {
      return "Gang Horse - " + (this.horse ? this.horse.name : "");
    },
    htmlDescription() {
      return this.horse
        ? this.horse.tagline + " - " + this.shortenSentence(this.stripHtml(this.horse.description), 100) + "..."
        : this.pageDescription();
    },
    htmlImage() {
      return this.horse ? (this.horse.imageUrls[0] ? "https://gang.horse" + this.horse.imageUrls[0].url : null) : null;
    },
  },

  preFetch({ store, currentRoute }) {
    const getMessagesByTopic = store.dispatch("messageStore/getMessagesByTopic", currentRoute.params.horseId);

    const fetchHorseById = store.dispatch("horseStore/fetchHorseById", currentRoute.params.horseId);
    return Promise.all([fetchHorseById, getMessagesByTopic]);
  },

  mounted() {
    this._keyListener = throttle(function (e) {
      e.preventDefault(); // present "Save Page" from getting triggered.

      const imageCarousel = this.$refs.imageCarousel;
      if (imageCarousel && this.keyboadModeEnabled) {
        if (e.code === "KeyF") {
          imageCarousel.toggleFullscreen();
        } else if (e.code === "Escape") {
          imageCarousel.exitFullscreen();
        } else if (e.code === "ArrowLeft") {
          imageCarousel.previous();
        } else if (e.code === "ArrowRight") {
          imageCarousel.next();
        }
      }
    }, 300);

    setTimeout(() => {
      this.loadFail = !this.horse;
    }, 1000);

    document.addEventListener("keyup", this._keyListener.bind(this));
  },
  beforeDestroy() {
    document.removeEventListener("keyup", this._keyListener);
  },
};
</script>

<style lang="scss" scoped>
.heading {
  font-weight: bold;
}

.backgroundImage {
  height: 100%;
  width: 100%;
}
.carousel {
  background: $grey-2;

  .slide {
    padding: 1%;
  }
}

.q-carousel {
  &::v-deep {
    .q-carousel__navigation--bottom {
      bottom: 0 !important;
    }
  }
}

.youtubeContainer {
  display: flex;
  width: 80%;
  height: 0;
  padding-bottom: 56.25%;
  margin-left: 10%;
  background-color: $grey-3;
  border: 1px solid $grey-8;

  .confimation {
    margin: auto;
  }
}
</style>
