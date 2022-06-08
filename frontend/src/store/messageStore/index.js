
import { messageFindByTopic, messageAddNew } from "./../../helpers/apiService"

export default {
    namespaced: true,
    state: {
        messages: []
    },
    mutations: {
        setMessages(state, messages) {
            state.messages = messages;
        },
        addMessage(state, message) {
            state.messages.push(message)
        }
    },
    actions: {
        async getMessagesByTopic({ commit }, topicId) {
            console.debug('invoke getMessagesByTopic', topicId)
            const response = await messageFindByTopic(topicId)
            if (response) {
                commit('setMessages', response)
            }
        },
        async sendMessage({ commit }, message) {
            console.debug('invoke sendMessage', message)
            const response = await messageAddNew(message);
            if (response) {
                commit('addMessage', response)
            }
        },
    },
    getters: {
        messages: state => {
            return state.messages
        }
    }
};
