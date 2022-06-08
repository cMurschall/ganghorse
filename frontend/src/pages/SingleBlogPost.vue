<template>
  <q-page padding>
    <div class="row">
      <div class="col-12 col-sm-9 offset-sm-1 col-md-6 offset-md-1">
        <h1 class="text-h4 cursor-pointer backLink" @click="backToBlog">
          {{ $t("blog.backToBlog") }}
        </h1>

        <div v-if="singlePost">
          <h4 class="text-h5 q-mb-xs">{{ singlePost.title }}</h4>
          <div class="text-subtitle2 q-mb-md">
            {{ singlePost.author }}
            <small
              >({{
                new Date(singlePost.date).toLocaleDateString($i18n.locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }})</small
            >
          </div>
          <q-img
            v-if="singlePost.imageUrl"
            :src="getImageUrl(singlePost)"
            :alt="'Islandpferd ' + singlePost.title"
          />

          <div class="post" v-html="singlePost.body"></div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from "vuex";
import { apiBaseUrl } from "./../helpers/apiService";
export default {
  name: "blog",
  meta() {
    return {
      title: this.htmlTitle,

      meta: {
        ogType: { name: "og:type", content: "article" },
        ...this.createMetaTitle(this.htmlTitle),
        ...this.createMetaDescription(this.htmlDescription),
        ...this.createSpecificMetaUrl(`/blog/${this.$route.params.id}`),
      },
      link: {
        canonical: {
          rel: "canonical",
          href: `https://gang.horse/blog/${this.$route.params.id}}`,
        },
      },
    };
  },
  computed: {
    ...mapGetters("blogStore", ["posts", "postById"]),

    singlePost() {
      return this.postById(this.$route.params.id);
    },
    htmlTitle() {
      return `Gang Horse - ${this.singlePost.title}`;
    },
    htmlDescription() {
      return this.singlePost.excerpt; //this.shortenSentence(this.stripHtml(this.singlePost.body), 160);
    },
  },
  methods: {
    backToBlog() {
      this.$router.push({ name: "blog" }).catch((err) => {});
    },
    getImageUrl(post) {
      if (post.imageUrl) {
        return apiBaseUrl + post.imageUrl;
      }
    },
  },

  preFetch({ store, currentRoute }) {
    const fetchPosts = store.dispatch("blogStore/fetchPosts");
    return Promise.all([fetchPosts]);
  },
};
</script>

<style lang="scss" scoped>
.post {
  margin-top: 2em;
  padding: 0.5em;
}

.backLink {
  color: $gangHorseBlue;
}
</style>