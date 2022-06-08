<template>
  <div class="locationSeachMap">
    <svg
      :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`"
      preserveAspectRatio="xMinYMin meet"
    >
      <path class="map" :d="path" />

      <path class="circle" :d="circle" />

      <!-- <circle r="5" :cx="circleCoordinate[0]" :cy="circleCoordinate[1]" /> -->
    </svg>
  </div>
</template>

<script>
/* eslint-disable */

import d3 from "./../helpers/d3";
import maps from "./../helpers/maps";

let uuid = 0;

export default {
  name: "LocationSeachMap",
  props: ["location", "seachRadius"],
  data() {
    return {
      horseMapId: "locationSeachMap" + this.uuid,
      dimensions: {
        width: 50,
        height: 50
      }
    };
  },
  //   methods: {
  //     getCoordinateFromLocation(loc) {
  //       return [horse.location.longitude, horse.location.latitude];
  //     }
  //   },

  computed: {
    projector() {
      return d3
        .geoMercator()
        .fitSize(
          [this.dimensions.width, this.dimensions.height],
          this.geoFeatureCollection
        );
    },
    path() {
      var geoGenerator = d3.geoPath().projection(this.projector);
      return geoGenerator(this.geoFeatureCollection);
    },
    geoFeatureCollection() {
      return {
        type: "FeatureCollection",
        features: this.jsonMapFeatures || [] //
      };
    },
    countrycode() {
      console.debug(typeof this.location);

      return this.location.countrycode
        ? this.location.countrycode.toLowerCase()
        : "de";
    },
    jsonMapFeatures() {
      return [maps[this.countrycode]];
    },
    circleCoordinate() {
      // console.log(
      //   this.projector([this.location.longitude, this.location.latitude])
      // );
      return this.projector([this.location.longitude, this.location.latitude]);
    },
    circle() {
      var circumference = 6371000 * Math.PI * 2;
      var angle = ((this.seachRadius * 1000) / circumference) * 360;
      var circle = d3
        .geoCircle()
        .center([this.location.longitude, this.location.latitude])
        .radius(angle);


   var geoGenerator = d3.geoPath().projection(this.projector);

      return geoGenerator(circle());
    }
  }
};
</script>

<style lang="scss">
.locationSeachMap {
  width: 100%;
  height: 100%;
  svg {
    margin: 0px !important;
  }
  .map {
    fill: $grey-5;
    stroke: #000;
    stroke-width: 0.1px;
  }
  .circle {
    fill: $primary;
    fill-opacity: 0.3;
    // stroke: #111;
    //     stroke-width: 0.1px;
  }
}
</style>


