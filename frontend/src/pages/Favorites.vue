<template>
  <q-page padding>
    <!-- content -->
    <div class="row justify-center">
      <div class="col-12 col-sm-12">
        <q-card v-if="isLoggedIn">
          <q-card-section>
            <h1 class="text-h6">{{ $t("appLayout.favorites") }}</h1>
          </q-card-section>

          <q-card-section>
            <div class="row">
              <div v-if="favorites.length">
                <div
                  class="col-md-3 col-sm-6 col-xs-12 q-pa-sm"
                  v-for="horse in favorites"
                  :key="horse.id"
                >
                  <HorseSummaryCard :horse="horse" />
                </div>
              </div>
              <div v-else>{{ $t("favorites.noFavorites") }}</div>
            </div>
          </q-card-section>
        </q-card>
        <div v-else>{{ $t("general.youAreNotLogedIn") }}</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import HorseSummaryCard from "./../components/HorseSummaryCard";

export default {
  name: "Favorites",
  components: { HorseSummaryCard },
  meta() {
    return {
      title: "Gang Horse - " + this.$t("appLayout.favorites"),
      meta: {
        ...this.createMetaTitle(
          "Gang Horse - " + this.$t("appLayout.favorites")
        ),
      },
    };
  },
  data() {
    return {
      favorites: [],
    };
  },
  methods: {
    ...mapActions("horseStore", ["fetchHorseById"]),
    ...mapActions("favoritesStore", ["getFavorites"]),
  },
  computed: {
    ...mapGetters("favoritesStore", ["favoriteHorses"]),
    ...mapGetters("userStore", ["isLoggedIn"]),
  },
  async mounted() {
    try {
      await this.getFavorites();

      for await (const id of this.favoriteHorses) {
        try {
          const fav = await this.fetchHorseById(id);
          console.log(fav);
          this.favorites.push(fav);
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
};
</script>
