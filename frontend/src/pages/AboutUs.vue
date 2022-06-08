<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-sm-12">
        <q-card>
          <q-card-section>
            <h1 class="text-h6">{{ $t("appLayout.aboutUs") }}</h1>
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
import En from "./aboutus/en";
import De from "./aboutus/de";
export default {
  name: "AboutUs",
  components: { En, De },
  meta() {
    return {
      title: "Gang Horse - About Us",
      meta: {
        ...this.createMetaTitle("Gang Horse - About Us"),
      },
    };
  },
};
</script>
