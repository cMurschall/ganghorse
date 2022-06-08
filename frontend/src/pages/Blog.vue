<template>
  <q-page padding>
    <div class="row">
      <div class="col-12 col-sm-9 offset-sm-1 col-md-6 offset-md-1">
        <h1 class="text-h4">Blog</h1>
        <div bordered>
          <article
            class="q-pa-md row items-start q-gutter-md "
            v-for="(post, index) in posts.reverse()"
            :key="'post_' + index"
          >
            <q-card class="full-width">
              <div class="q-pa-sm cursor-pointer" @click="openBlogPost(post)">
                <q-img
                  basic
                  v-if="post.imageUrl"
                  :src="getImageUrl(post)"
                  :alt="'Islandpferd ' + post.title"
                >
                  <div class="absolute-bottom text-subtitle2 text-center">
                    {{ post.title }}
                  </div>
                </q-img>
              </div>
              <q-card-section class="q-pt-none">
                <div class="post">
                  {{ post.excerpt
                  }}<span class="moreLink cursor-pointer" @click="openBlogPost(post)">
                    {{ $t("blog.more") }}</span
                  >
                </div>
              </q-card-section>
            </q-card>
          </article>
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
      },
    };
  },
  computed: {
    ...mapGetters("blogStore", ["posts", "postById", "displayMode"]),

    htmlTitle() {
      return `Gang Horse - Blog`;
    },
    htmlDescription() {
      return this.pageDescription();
    },
  },
  methods: {
    getImageUrl(post) {
      if (post.imageUrl) {
        return apiBaseUrl + post.imageUrl;
      }
    },
    openBlogPost(post) {
      this.$router
        .push({
          name: "blogById",
          params: {
            id: post.id,
          },
        })
        .catch((err) => {});
    },
  },

  preFetch({ store, currentRoute }) {
    const fetchPosts = store.dispatch("blogStore/fetchPosts");

    return Promise.all([fetchPosts]);
  },
};
</script>

<style lang="scss" scoped>
.moreLink {
  color: $gangHorseBlue;
}
</style>