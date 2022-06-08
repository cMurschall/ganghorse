<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  meta() {
    return {
      // sets document title
      title: this.pageTitle(),
      //title: this.$i18n.locale,

      lang: this.$i18n.locale,

      // meta tags

      meta: {
        ogType: { name: "og:type", content: "website" },
        ...this.createMetaTitle(this.pageTitle()),
        ...this.createMetaDescription(this.pageDescription()),
        ...this.createMetaImage(this.pageImage()),
        ...this.createMetaUrl(),

        // keywords: { name: "keywords", content: this.pageKeywords() },
        ogLocale: { name: "og:locale", content: this.$i18n.locale },
      },
      link: {
        canonical: {
          rel: "canonical",
          href: `https://gang.horse${this.$router.currentRoute.path}`,
        },
      },
    };
  },

  preFetch({ store }) {
    const whoAmI = store.dispatch("userStore/whoAmI");
    const fetchHorses = store.dispatch("horseStore/fetchHorses");
    const getFavorites = store.dispatch("favoritesStore/getFavorites");
    const fetchConversations = store.dispatch("conversationStore/fetchConversations");

    return Promise.all([whoAmI, fetchHorses, getFavorites, fetchConversations]);
  },
};
</script>
