<template>
  <q-card v-if="usersHorses.length">
    <q-card-section>
      <div class="text-h5">
        {{ $t("horseDetail.moreAdversOfUser", { ownerName: owner.name }) }}
      </div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <div class="q-pa-sm">
        <div class="row no-wrap scroll">
          <div :style="getRowClass">
            <div
              v-for="horse in usersHorses"
              :key="horse.id"
              class="col-xl-4 col-lg-5 col-md-7 col-sm-8 col-xs-11 q-pa-sm"
            >
              <HorseSummaryCard :horse="horse" />
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { horseFindUserIds } from "./../helpers/apiService";
import { mapGetters, mapActions } from "vuex";
import HorseSummaryCard from "./../components/HorseSummaryCard";
export default {
  name: "OtherHorsesCarusel",
  components: { HorseSummaryCard },
  props: {
    owner: {
      type: Object,
    },
    exeptionId: {
      type: String,
    },
  },
  data() {
    return {
      usersHorses: [],
      slide: 0,
    };
  },
  methods: {
    ...mapActions("horseStore", ["fetchHorseById"]),
    ...mapActions("userStore", ["fetchUserById"]),
  },
  computed: {
    ...mapGetters("userStore", ["userById"]),
    getRowClass() {
      return {
        display: "grid",
        gridTemplateColumns: `repeat(${this.usersHorses.length}, minmax(290px, 1fr))`,
        columnGap: "1em",
        rowGap: "1em",
      };
    },
  },
  async mounted() {
    //   console.log(this.owner)

    try {
      var userIds = await horseFindUserIds(this.owner.id);

      let horses = await Promise.all(
        userIds.map(async (x) => {
          return await this.fetchHorseById(x.horseId);
        })
      );
      this.usersHorses = horses.filter((x) => x.id != this.exeptionId);
    } catch (error) {
      this.$q.notify({
        message: `Reqest failed with :"${error}`,
        color: "negative",
      });
    }
  },
};
</script>

<style lang="scss" scoped>
</style>