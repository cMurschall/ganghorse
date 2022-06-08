import Vue from "vue";
import VueI18n from "vue-i18n";
import messages from "src/i18n"

Vue.use(VueI18n);


var userLang = "de-de" // german by default


if (process.env.MODE === "spa") {
  // if users browser does not accept german we can switch back to german
  var browserLang = (navigator.language || navigator.userLanguage).toString().toLowerCase()
  if (!browserLang.includes('de')) {
    userLang = "en-gb"
  }

  // but if the user has set up their languate we honour it and override all our other assumptions. 
  var localStorageLang = localStorage.getItem('userLang');
  if (localStorageLang) {
    userLang = localStorageLang
    console.debug("override browser language by user selection: ", userLang)
  }
}


const i18n = new VueI18n({
  locale: userLang,
  fallbackLocale: "de-de",
  messages
});



export default ({ app }) => {
  // Set i18n instance on app
  app.i18n = i18n;
};

export { i18n };
