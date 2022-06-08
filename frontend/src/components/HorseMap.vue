<template>
  <div class="horseMap">
    <svg :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`" preserveAspectRatio="xMinYMin meet">
      <path :d="path" />
      <circle
        v-for="(horse, index) in horses"
        :key="'horse_' + index"
        r="5"
        :cx="projector(getCoordinateFromHorse(horse))[0]"
        :cy="projector(getCoordinateFromHorse(horse))[1]"
      />
    </svg>
  </div>
</template>

<script>
/* eslint-disable */

import d3 from "./../helpers/d3";
import maps from "./../helpers/maps";

let uuid = 0;

export default {
  name: "HorseMap",
  props: ["horses"],
  data() {
    return {
      horseMapId: "horseMapId" + this.uuid,
      dimensions: {
        width: 300,
        height: 220,
      },
    };
  },
  methods: {
    getCoordinateFromHorse(horse) {
      return [horse.location.longitude, horse.location.latitude];
    },
  },

  computed: {
    projector() {
      return d3.geoMercator().fitSize([this.dimensions.width, this.dimensions.height], this.geoFeatureCollection);
    },
    path() {
      var geoGenerator = d3.geoPath().projection(this.projector);

      return geoGenerator(this.geoFeatureCollection);
    },
    geoFeatureCollection() {
      return {
        type: "FeatureCollection",
        features: this.jsonMapFeatures || [], //
      };
    },
    jsonMapFeatures() {
      return [...new Set(this.horses.map((x) => x.location.countrycode.toLowerCase()))].map((x) => maps[x]);
    },
  },
};
</script>

<style lang="scss">
.horseMap {
  padding: 0.6em;
  width: 100%;
  height: 100%;

  svg {
    margin: 0px !important;
    // padding-top: 10px;
    // border: 2px solid red;
  }
  path {
    fill: $grey-3;
    stroke: #000;
    stroke-width: 0.3px;
  }
  circle {
    fill: rgb(255, 0, 0);
    fill-opacity: 0.9;
    stroke: #111;
  }
}
</style>


