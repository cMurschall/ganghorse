<template></template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      switch (to.params.language) {
        case "de":
          vm.$i18n.locale = "de-de";
          break;
        case "en":
          vm.$i18n.locale = "en-gb";
          break;
        default:
          break;
      }

      vm.$router.push({ name: "home" });
    });
  },
};
</script>

<style>
</style>