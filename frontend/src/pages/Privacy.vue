<template>
  <q-page padding>
    <!-- content -->
    <div class="row justify-center">
      <div class="col-12 col-sm-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ $t("appLayout.privacy") }}</div>
          </q-card-section>

          <q-card-section>
            <div class="row">
              <div class="col-md-10 q-pa-md">
                <de v-if="$i18n.locale == 'de-de'" />
                <en v-else />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import En from "./privacy/en";
import De from "./privacy/de";
export default {
  name: "Privacy",
  components: { En, De },
  meta() {
    return {
      title: "Gang Horse - " + this.$t("appLayout.privacy"),
      meta: {
        ...this.createMetaTitle("Gang Horse - " + this.$t("appLayout.privacy")),
      },
    };
  },
  data() {
    return {};
  },
};
</script>

<style>
</style>