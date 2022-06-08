
import { conversationGetAll } from "./../../helpers/apiService"

export default {
    namespaced: true,
    state: {
        conversations: []
    },
    mutations: {
        setConversations(state, conversations) {
            state.conversations = conversations;
        },
        addMessage(state, message) {
            console.log('add message', message)
            const relatedConversation = state.conversations.find(x => x.id === message.conversation.id)
            if (relatedConversation) {
                console.log('found relatedConversation', relatedConversation)
                relatedConversation.messages.push(message)
            }
            else {
                // console.log('orphand message' , message) 
                // we need to create a new node and append it manually.
                const conversation = message.conversation
                conversation.messages = [message]
                console.log('new conversation', conversation)
                state.conversations.push(conversation)
            }
        },
        markMessageSeen(state, messageId) {
            console.log('markMessageSeen', messageId)
            for (const conversation of state.conversations) {
                for (const message of conversation.messages) {
                    if (message.id === messageId) {
                        message.readByReceiver = true
                    }
                }
            }
        }
    },
    actions: {
        async fetchConversations({ commit }) {
            const response = await conversationGetAll();
            commit('setConversations', response)
        },
        socket_messageReceived({ commit }, message) {
            commit('addMessage', message)
        },
        socket_messageRead({ commit }, messageId) {
            commit('markMessageSeen', messageId)
        }
    },
    getters: {
        conversations: state => {
            // sort by the last message in conversation.
            const sortedConversations = state.conversations.slice().sort((a, b) => {
                const lastMessageA = Math.max(...a.messages.map(x => new Date(x.createdAt)))
                const lastMessageB = Math.max(...b.messages.map(x => new Date(x.createdAt)))

                return lastMessageB - lastMessageA
            })
            return sortedConversations
        },
        unreadMessagesByConversationId: (state, _getters, _rootState, rootGetters) => (id) => {
            const currentUser = rootGetters['userStore/currentUser']
            const relatedConversation = state.conversations.find(x => x.id === id)
            if (relatedConversation && currentUser) {
                const otherMessages = relatedConversation.messages.filter(x => x.senderUserId !== currentUser.id)
                const messagesNotSeenByOthers = otherMessages.filter(x => !x.readByReceiver)
                return messagesNotSeenByOthers.length
            }

            return 0;
        },
        unreadMessagesTotal: (state, getters) => {
            return state.conversations
                .reduce((a, b) => a + getters.unreadMessagesByConversationId(b.id), 0)
        }
    }
};


