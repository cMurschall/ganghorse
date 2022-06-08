<template>
  <q-page padding>
    <!-- content -->
    <div class="row justify-center">
      <div class="col-12 col-sm-12">
        <q-card v-if="isLoggedIn">
          <q-card-section>
            <!-- <div class="text-h6">{{ $t('createHorse.newHorse') }}</div> -->
            <div class="text-h6">{{ $t("ownHorses.myAdvertisements") }}</div>
          </q-card-section>

          <q-card-section>
            <div class="row">
              <div
                class="col-md-4 col-sm-6 q-pa-md"
                v-for="data in ownHorses"
                :key="data.horse.id"
              >
                <q-card flat class="bg-grey-3">
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar>
                        <q-icon :name="getMainImage(data.horse.imageUrls)" />
                      </q-avatar>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ data.horse.name }}</q-item-label>
                      <q-item-label caption
                        >{{ $t("ownHorses.generatedAt") }}
                        {{
                          new Date(data.horse.createdAt).toLocaleDateString(
                            $i18n.locale,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        }}</q-item-label
                      >
                    </q-item-section>

                    <q-item-section side>
                      <q-btn
                        dense
                        round
                        color="white"
                        text-color="green-2"
                        icon="favorite"
                        size="md"
                      >
                        <q-badge
                          color="gangHorseBlue"
                          text-color="white"
                          floating
                          :label="data.favoriteCount"
                        ></q-badge>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                  <q-separator />

                  <q-card-actions align="around">
                    <q-select
                      filled
                      v-model="data.horse.status"
                      map-options
                      :options="getStatusMap()"
                      option-value="index"
                      option-label="value"
                      emit-value
                      color="gangHorseBlue"
                      :label="$t('createHorse.status')"
                      @input="
                        changeHorseStatus({
                          horseId: data.horse.id,
                          newStatus: $event,
                        })
                      "
                    />

                    <q-btn flat @click="editHorse(data.horse)">{{
                      $t("ownHorses.edit")
                    }}</q-btn>

                    <q-btn flat @click="removeHorse(data.horse)">{{
                      $t("ownHorses.delete")
                    }}</q-btn>
                  </q-card-actions>
                </q-card>
              </div>
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
import { horseGetOwn } from "./../helpers/apiService";

export default {
  name: "OwnHorses",
  components: { HorseSummaryCard },
  data() {
    return {
      ownHorses: [],
    };
  },
  methods: {
    ...mapActions("horseStore", ["deleteHorse", "changeStatus"]),
    getMainImage(imageUrls) {
      if (imageUrls && imageUrls.length > 0) {
        return `img:${imageUrls[0].url}`;
      } else {
        return "crop_original";
      }
    },
    async changeHorseStatus({ horseId, newStatus }) {
      try {
        var result = await this.changeStatus({ horseId, newStatus });

        this.$q.notify({
          message: result.success
            ? this.$t("ownHorses.changeStatusSuccess", {
                newStatus: this.getStatus(newStatus),
              })
            : this.$t("ownHorses.changeStatusFail"),
          color: result.success ? "positive" : "negative",
        });
      } catch (error) {
        console.error(error);
        this.$q.notify({
          message: this.$t("ownHorses.statusUpdateError", { error }),
          color: "negative",
        });
      }
    },
    async removeHorse(horse) {
      console.log(this.ownHorses);

      var index = this.ownHorses.findIndex((x) => x.horse.id == horse.id);

      var success = await this.deleteHorse(horse);
      if (success) {
        console.log("remove horse at index" + index);
        if (index >= 0) {
          this.ownHorses.splice(index, 1);
        }
      }

      this.$q.notify({
        message: success
          ? this.$t("ownHorses.deleteSuccess", { horseName: horse.name })
          : this.$t("ownHorses.deleteFail", { horseName: horse.name }),
        color: success ? "positive" : "negative",
      });
    },
    editHorse(horse) {
      this.$router
        .push({
          name: "createHorse",
          params: {
            horseId: horse.id,
          },
        })
        .catch((err) => {});
    },
  },
  computed: {
    ...mapGetters("userStore", ["currentUser", "isLoggedIn"]),
  },
  async mounted() {
    try {
      const ownHorses = await horseGetOwn();
      if (ownHorses) {
        this.ownHorses = ownHorses;
      }
    } catch (error) {
      console.error(error);
    }
  },
};
</script>
