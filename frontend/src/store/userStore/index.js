
import Vue from "vue";
import {
  userWhoAmI,
  userInfo,
  userUpdate,
  userLogin,
  userLogout,
  userForgotPassword,
  userChangeForgotPassword,
  userDeleteAccount,

  userSearchGetAll,
  userSearchAddNew,
  userSearchRemove
} from "./../../helpers/apiService"

const undefinedUser = ''

var userCurrency = 0;
if (process.env.MODE === "spa") {
  userCurrency = localStorage.getItem("currency") || 0
}



export default {
  namespaced: true,
  state: {
    user: undefinedUser,
    userCurrency: userCurrency,
    storedSeaches: [],
    externalContentConsentGiven: false,
    otherUsers: {}
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setUserName(state, username) {
      state.user.name = username
    },
    setUserDescription(state, description) {
      state.user.publicDescription = description
    },
    setUserCanNotify(state, canNotify) {
      state.user.canNotify = canNotify
    },
    setUserCurrency(state, currency) {
      state.userCurrency = currency
    },
    addUserSeaches(state, searches) {
      state.storedSeaches = searches
    },
    addUserSeach(state, search) {
      state.storedSeaches.push(search)
    },
    removeUserSeach(state, search) {
      // todo
      var index = state.storedSeaches.indexOf(search);
      if (index > -1) {
        state.storedSeaches.splice(index, 1);
      } else {
        console.log("could not find seach: ", search)
      }
    },
    addOtherUser(state, user) {
      Vue.set(state.otherUsers, user.id, user);
      //state.otherUsers[user.id] = user;
    },
    setExternalContentConsent(state, consent) {
      state.externalContentConsentGiven = consent
    },
  },
  actions: {
    async whoAmI({ commit }) {
      console.debug('invoke whoAmI')
      const response = await userWhoAmI()
      if (response) {
        commit('setUser', response)
      }
    },
    async logout({ commit }) {
      await userLogout()
      commit('setUser', undefinedUser)
    },
    async login({ commit }, loginData) {
      const response = await userLogin(loginData)
      if (response) {
        commit('setUser', response)
      }
    },
    async updateUser({ commit }, user) {
      const response = await userUpdate(user)
      if (response && response.success) {
        commit('setUser', response.updatedUser)
      }
      return response
    },
    async forgotPassword({ }, resetData) {
      const response = await userForgotPassword(resetData)
      console.debug('forgotPassword', response)
    },
    async changeforgotPassword({ dispatch }, resetData) {
      const response = await userChangeForgotPassword(resetData);
      if (response) {
        await dispatch('whoAmI')
      }
      console.debug('changeforgotPassword', response)
    },
    async deleteAccount({ dispatch }) {
      await userDeleteAccount();
      await dispatch('whoAmI')
    },
    async fetchUserSearch({ commit }) {
      const response = await userSearchGetAll()
      if (response && response.length) {
        commit('addUserSeaches', response)
      }
    },
    async addUserSearchToServer({ commit }, search) {
      const response = await userSearchAddNew(search)
      if (response) {
        commit('addUserSeach', search)
      }
    },
    async removeUserSearchFromServer({ commit }, search) {
      const response = await userSearchRemove(search.label)
      if (response) {
        commit('removeUserSeach', search)
      }
    },
    async fetchUserById({ commit }, userId) {
      const response = await userInfo(userId);
      if (response) {
        commit('addOtherUser', response)
      }
    },
  },
  getters: {
    isLoggedIn: state => {
      return state.user != undefinedUser
    },
    currentUser: state => {
      return state.user
    },
    userCurrency: state => {
      return state.userCurrency
    },
    userSearches: state => {
      return state.storedSeaches
    },
    externalConsent: state => {
      return state.externalContentConsentGiven
    },
    userById: state => userId => {
      return state.otherUsers[userId] || {}
    }
  }
};
