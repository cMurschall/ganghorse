
import {
    favoritesGetAll,
    favoriteAddNew,
    favoriteRemove
} from "./../../helpers/apiService"

export default {
    namespaced: true,
    state: {
        favoriteHorseIds: []
    },
    mutations: {
        setFavorites(state, favorites) {
            state.favoriteHorseIds = favorites;
        },
        addFavorite(state, horse) {
            state.favoriteHorseIds.push(horse.id)
        },
        removeFavorite(state, horse) {
            var index = state.favoriteHorseIds.indexOf(horse.id);
            if (index !== -1) state.favoriteHorseIds.splice(index, 1);
        }
    },
    actions: {
        async getFavorites({ commit }) {
            console.debug('invoke getFavorites ')
            const data = await favoritesGetAll();
            if (data.success) {
                commit('setFavorites', data.horseIds)
            }
        },
        toggleFavorite({ getters, dispatch }, horse) {
            if (getters.isHorseFavorite(horse)) {
                dispatch('removeFavorite', horse)
            } else {
                dispatch('setAsFavorite', horse)
            }
        },
        async setAsFavorite({ commit }, horse) {
            console.debug('invoke setAsFavorite : ', horse)
            const data = await favoriteAddNew(horse.id)
            if (data) {
                commit('addFavorite', horse)
            }
        },
        async removeFavorite({ commit }, horse) {
            console.debug('invoke removeFavorite : ', horse)
            const data = await favoriteRemove(horse.id)
            if (data) {
                commit('removeFavorite', horse)
            }
        },
    },
    getters: {
        isHorseFavorite: (state) => (horse) => {
            return state.favoriteHorseIds.findIndex(horseId => horseId == horse.id) != -1
        },
        favoriteHorses: (state, getters, rootState) => {
            console.debug({ state, getters, rootState })
            return state.favoriteHorseIds
        },
    }
};


