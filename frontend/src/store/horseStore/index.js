import {
  horseFindByOptions,
  horseGetRange,
  horseGetById,
  horseUpdate,
  horseRemove,
  horseChangeStatus
} from "./../../helpers/apiService"

import Vue from 'vue';

export const paginationStep = 50

const initialRange = {
  "priceRange":
  {
    "min": 0,
    "max": 1
  },
  "heightRange":
  {
    "min": 0,
    "max": 1
  },
  "ageRange":
  {
    "min": 0,
    "max": 1
  },
  "colors": [],
  "filterdHorseCount": 0
}


export default {
  namespaced: true,
  state: {
    serverRange: initialRange,
    horses: [],
    page: {
      skip: 0,
      take: paginationStep
    },
    filterdHorseCount: 0
  },
  mutations: {
    setServerRange(state, range) {
      //state.serverRange = range
      Vue.set(state.serverRange.priceRange, 'min', range.priceRange.min)
      Vue.set(state.serverRange.priceRange, 'max', range.priceRange.max)

      Vue.set(state.serverRange.ageRange, 'min', range.ageRange.min)
      Vue.set(state.serverRange.ageRange, 'max', range.ageRange.max)

      Vue.set(state.serverRange, 'colors', range.colors)
    },
    setHorses(state, horses) {
      state.horses = horses
    },
    appendHorses(state, horses) {
      horses.forEach(horse => {
        state.horses.push(horse)
      });
      console.debug('loaded horses', state.horses.length);
    },
    setPagination(state, pagination) {
      state.page.skip = pagination.skip
      state.page.take = pagination.take
    },
    resetPagination(state) {
      state.page.skip = 0
      state.page.take = paginationStep
    },

    setSingleHorse(state, horse) {
      var index = state.horses.findIndex(x => x.id == horse.id)
      if (index == -1) {
        state.horses.unshift(horse)
      } else {
        state.horses.splice(index, 1, horse)
      }
    },
    updateHorse(state, horse) {
      var index = state.horses.findIndex(x => x.id == horse.id)
      if (index >= 0) {
        Vue.set(state.horses, index, horse)
      }

    },
    setFilterdHorseCount(state, count) {
      console.debug('filterdHorseCount', count);

      state.filterdHorseCount = count
    },
    removeSingleHorse(state, horse) {
      var index = state.horses.findIndex(x => x.id == horse.id)
      if (index >= 0) {
        state.horses.splice(index, 1);
      }
    }
  },
  actions: {
    async fetchRange({ commit, rootGetters }) {
      const response = await horseGetRange(rootGetters['userStore/userCurrency'])
      if (response) {
        commit('setServerRange', response)
      }
    },
    async fetchFilteredHorses({ commit, state, rootGetters }, { seachRange, mode }) {
      const data = await horseFindByOptions(seachRange, state.page, rootGetters['userStore/userCurrency'])
      const { horses, count } = data

      commit('setFilterdHorseCount', count)

      if (mode === 'replace') {
        commit('setHorses', horses)
      } else if (mode === 'append') {
        commit('appendHorses', horses)
      } else {
        console.error('unknown mode', mode)
      }
    },
    async fetchHorseById({ commit, state }, horseId) {

      const index = state.horses.findIndex(horse => horse.id == horseId)
      if (index == -1) {
        const horse = await horseGetById(horseId)
        if (horse) {
          commit('setSingleHorse', horse)
          return horse
        } else {
          return false
        }
      } else {
        return state.horses[index]
      }
    },
    async fetchHorses({ dispatch }) {
      await dispatch('fetchFilteredHorses', { seachRange: {}, mode: 'replace' })
    },
    async updateHorse({ commit }, horse) {
      const updatedHorse = await horseUpdate(horse)
      if (updatedHorse) {
        commit('setSingleHorse', updatedHorse)
        return updatedHorse
      }
    },
    async deleteHorse({ commit }, horse) {
      const result = await horseRemove(horse.id)
      if (result) {
        commit('removeSingleHorse', horse)
      }
      return result;
    },
    async changeStatus({ }, { horseId, newStatus }) {
      return await horseChangeStatus(horseId, newStatus)
    },
  },

  getters: {
    serverRange: state => {
      return state.serverRange
    },
    priceRangeMin: state => {
      return state.serverRange.priceRange.min
    },
    priceRangeMax: state => {
      return state.serverRange.priceRange.max
    },

    ageRangeMin: state => {
      return state.serverRange.ageRange.min
    },
    ageRangeMax: state => {
      return state.serverRange.ageRange.max
    },
    colors: state => {
      return state.serverRange.colors
    },
    horses: state => {
      return state.horses
    },
    horseById: (state) => (id) => {
      return state.horses.find(horse => horse.id == id)
    },
    hasMorePages: (state) => {
      // console.log("hasMorePages", {
      //   filterdHorseCount: state.filterdHorseCount,
      //   localHorsese: state.horses.length,
      //   hasMorePages: state.filterdHorseCount > state.horses.length
      // })
      return state.filterdHorseCount > state.horses.length
    }
  }
};
