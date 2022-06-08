<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" style="width:30vw;max-width:200px;" />
    </p>
    <p class="text-faded">{{ $t('general.404Error') }}<strong>(404)</strong></p>
    <q-btn color="gangHorseBlue" style="width:200px;" to="/" :label="$t('appLayout.home')" />
  </div>
</template>

<script>
export default {
  name: "Error404"
};
</script>
