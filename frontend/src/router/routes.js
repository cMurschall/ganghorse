import { userConfirm }  from "./../helpers/apiService"


// https://www.youtube.com/watch?v=
const tenHoursOfFun =
  [
    "wbby9coDRCk",
    "nb2evY0kmpQ",
    "eh7lp9umG2I",
    "z9Uz1icjwrM",
    "Sagg08DrO5U",
    "5XmjJvJTyx0",
    "IkdmOVejUlI",
    "jScuYd3_xdQ",
    "S5PvBzDlZGs",
    "9UZbGgXvCCA",
    "O-dNDXUt1fg",
    "MJ5JEhDy8nE",
    "VnnWp_akOrE",
    "jwGfwbsF4c4",
    "8ZcmTl_1ER8",
    "gLmcGkvJ-e0",
    "hGlyFc79BUE",
    "xA8-6X8aR3o",
    "7R1nRxcICeE",
    "sCNrK-n68CM"
  ]
const botRoutes = [
  "/admin.php",
  "/admin/login.php",
  "/administrator/index.php",
  "/ajaxproxy/proxy.php",
  "/bitrix/admin/index.php",
  "/index.php",
  "/magmi/web/magmi.php",
  "/wp-admin/admin-ajax.php",
  "/wp-admin/includes/themes.php",
  "/wp-admin/options-link.php",
  "/wp-admin/post-new.php",
  "/wp-login.php",
  "/xmlrpc.php"]

const routes = [
  {
    path: "/",
    component: () => import("layouts/AppLayout.vue"),
    children: [
      { path: "/", name: "home", component: () => import("./../pages/Index.vue") },
      { path: "/horse/:horseId", name: "horseDetail", component: () => import("./../pages/HorseDetail.vue") },
      { path: "/horseEditor", name: "createHorse", component: () => import("./../pages/HorseEditor.vue") },
      { path: "/ownHorses", name: "ownHorses", component: () => import("./../pages/OwnHorses.vue") },
      { path: "/usersHorses/:userId", name: "usersHorses", component: () => import("./../pages/UsersHorses.vue") },
      { path: "/favorites", name: "favorites", component: () => import("./../pages/Favorites.vue") },
      { path: "/messageCentre", name: "messageCentre", component: () => import("./../pages/MessageCentre.vue") },
      { path: "/settings", name: "settings", component: () => import("./../pages/Settings.vue") },
      { path: "/aboutUs", name: "aboutUs", component: () => import("./../pages/AboutUs.vue") },
      { path: "/privacy", name: "privacy", component: () => import("./../pages/Privacy.vue") },
      { path: "/blog", name: "blog", component: () => import("./../pages/Blog.vue") },
      { path: "/blog/:id", name: "blogById", component: () => import("./../pages/SingleBlogPost") },
      { path: "/forgottenPassword/:token", name: "forgottenPassword", component: () => import("./../pages/ForgottenPassword") },


      { path: '/:language', name: 'language', component: () => import("./../pages/Language.vue") },
    ]
  },
  {
    // callback after login atempt. We want to fetch the user info here
    path: '/userValidate/:token',
    name: 'userValidationCallback',
    beforeEnter: async (to, from, next) => {

      if (to.params.token) {
        console.debug('validate token', to.params.token)
        const result = await userConfirm(to.params.token)
        next({ name: result ? 'settings' : 'home' })
      }
      // redirect where the user came from
      next({ name: 'home' })
    }
  },
  ...botRoutes.map(route => {
    return {
      path: route,
      beforeEnter() {
        location.href = `https://www.youtube.com/watch?v=${tenHoursOfFun[Math.floor(Math.random() * tenHoursOfFun.length)]}`
      }
    }

  })
];

// Always leave this as last one
routes.push({
  path: '*',
  component: () => import('pages/Error404.vue')
})

export default routes;
