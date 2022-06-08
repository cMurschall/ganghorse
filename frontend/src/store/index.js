import Vue from "vue";
import Vuex from "vuex";

import userStore from './userStore'
import horseStore from './horseStore'
import messageStore from './messageStore'
import favoritesStore from './favoriteStore'
import conversationStore from './conversationStore'
import blogStore from './blogStore'

Vue.use(Vuex);

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      userStore,
      horseStore,
      messageStore,
      favoritesStore,
      conversationStore,
      blogStore
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  });

  return Store;
}
