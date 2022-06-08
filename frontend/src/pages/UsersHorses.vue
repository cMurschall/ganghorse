<template>
  <q-page padding>
    <!-- content -->
    <div class="row justify-center">
      <div class="col-12 col-sm-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              {{
                $t("usersHorses.usersHorses", {
                  userName: userById(userId).name,
                })
              }}
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row">
              <div
                class="col-md-3 col-sm-6 col-xs-12 q-pa-sm"
                v-for="horse in usersHorses"
                :key="horse.id"
              >
                <HorseSummaryCard :horse="horse" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { horseFindUserIds } from "./../helpers/apiService";
import { mapGetters, mapActions } from "vuex";
import HorseSummaryCard from "./../components/HorseSummaryCard";

export default {
  name: "UsersHorses",
  components: { HorseSummaryCard },
  meta() {
    return {
      title: "Gang Horse - " + this.$t("appLayout.myAdvert"),
      meta: {
        ...this.createMetaTitle(
          "Gang Horse - " + this.$t("appLayout.myAdvert")
        ),
      },
    };
  },
  data() {
    return {
      usersHorses: [],
    };
  },
  methods: {
    ...mapActions("horseStore", ["fetchHorseById"]),
    ...mapActions("userStore", ["fetchUserById"]),
  },
  computed: {
    ...mapGetters("userStore", ["userById"]),
    userId() {
      return this.$route.params.userId;
    },
  },
  async mounted() {
    try {
      await this.fetchUserById(this.userId);
    } catch (error) {
      this.$q.notify({
        message: `Reqest failed with :"${error}`,
        color: "negative",
      });
    }

    try {
      var userIds = await horseFindUserIds(this.userId);

      let horses = await Promise.all(
        userIds.map(async (x) => {
          return await this.fetchHorseById(x.horseId);
        })
      );
      this.usersHorses = horses;
    } catch (error) {
      this.$q.notify({
        message: `Reqest failed with :"${error}`,
        color: "negative",
      });
    }
  },
};
</script>

<style>
</style>