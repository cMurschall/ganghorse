
import Vue from "vue";
import { blogGetAll, blogGetById } from "./../../helpers/apiService";
export default {
    namespaced: true,
    // IMPORTANT: state must be a function so the module can be
    // instantiated multiple times
    state: {
        posts: {},
    },
    mutations: {
        setPosts(state, posts) {
            for (const post of posts) {
                Vue.set(state.posts, post.id, post);
                //state.posts[post.id] = post
            }
        }
    },
    actions: {
        async fetchPosts({ commit }) {
            const response = await blogGetAll();
            if (response.length) {
                commit('setPosts', response)
            }
        },
        async fetchPostById({ commit }, id) {
            const response = await blogGetById(id);
            if (response) {
                commit('setPosts', [response])
            }
        },
    },
    getters: {
        posts: state => {
            return Object.values(state.posts)
        },
        postById: (state) => (id) => {
            return state.posts[id]
        }
    }
}