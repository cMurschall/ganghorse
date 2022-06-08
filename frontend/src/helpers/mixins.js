import { date } from "quasar";
import { mapGetters } from "vuex";
export const messageMixin = {
    data() {
        return {
            height: 70,
            messageMaxLength: 5000
        }
    },
    methods: {
        formatDate(timeStamp) {
            return date.formatDate(timeStamp, "DD.MM.YYYY HH:mm");
        },
        sortMessagesByDate(messages) {
            return messages.slice().sort((a, b) => {
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
        },
        getPartnerId(conversation) {
            return conversation.memberIds.filter(
                (x) => x !== this.currentUser.id
            )[0];
        },
    },
    computed: {
        ...mapGetters("userStore", ["currentUser", "isLoggedIn"]),
        isMobile() {
            return this.$q.screen.name === "xs";
        },
    },
}