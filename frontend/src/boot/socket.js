import VueSocketIO from 'vue-socket.io-extended';
import io from 'socket.io-client';



const ioInstance = io(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '/', {
  autoConnect: false, // no autoconnect. we only want a connection for logged in users. 
  reconnection: true,
  upgrade: false,
  transports: ['websocket'],
  reconnectionDelay: 500,
  maxReconnectionAttempts: Infinity,
  path: "/socket",
});

// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default ({ Vue, store }) => {
  Vue.use(VueSocketIO, ioInstance, { store });

  // lets watch the connected state and connect / disconnect accordingly
  const unwatchFunction = store.watch(() => store.getters['userStore/isLoggedIn'], isLoggedIn => {
    console.log('isLoggedIn changed, so lets ' + (isLoggedIn ? 'connect' : 'disconnect') + ' socket')

    if (isLoggedIn) {
      ioInstance.connect()
    } else if (ioInstance.connected) {
      ioInstance.disconnect()
    }
  })
}

