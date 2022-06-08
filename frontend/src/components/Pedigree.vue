<template>
  <div>
    <div :id="pedigreeId" class="pedigree"></div>
  </div>
</template>

<script>
/* eslint-disable */

import d3 from "./../helpers/d3";
let uuid = 0;

export default {
  name: "Pedigree",
  props: {
    horseData: {
      type: Object
    }
  },
  data() {
    return {
      pedigreeId: "pedigreeId" + this.uuid
    };
  },
  mounted() {
    const aspectRatio = 1 / 2;
    const generationDepth = 2;

    const imageWidth = generationDepth * 410;
    const imageHeight = imageWidth * aspectRatio;
    const textSize = 18;

    const boxWidth = imageWidth / (generationDepth + 1);
    const boxHeight = boxWidth * 0.6;

    const flagheight = textSize * 1.28;
    const flagwidth = (flagheight * 3) / 4;

    const getOrigin = horse => {
      return horse.id.substring(0, 2).toLowerCase();
    };

    const isLeaf = horse => {
      return horse.children == undefined;
    };

    const isRoot = horse => {
      return horse.isRoot;
    };

    const elbow = d => {
      var start = d.source.y;
      var end = d.target.y;

      if (isRoot(d.source.data)) {
        start = d.source.y - boxWidth / 2.3;
      } else if (isLeaf(d.target.data)) {
        end = d.target.y + boxWidth / 2.3;
      }

      return `M${start},${d.source.x}H${d.source.y +
        (d.target.y - d.source.y) / 2}V${d.target.x}H${end}`;
    };

    const svg = d3
      .select("#" + this.pedigreeId)
      .append("svg")
      .attr("viewBox", `0 0 ${imageWidth} ${imageHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      // Center
      .attr("transform", `translate(${boxWidth * 0.5},${imageHeight / 2})`);

    //  assigns the data to a hierarchy using parent-child relationships
    const nodes = d3.hierarchy(this.horseData, d => d.parents);

    // declares a tree layout and assigns the size
    const tree = d3
      .tree()
      .nodeSize([boxHeight, boxWidth])
      .separation((a,b) => {
        return (a.parent === b.parent) ? 0.7 : 0.5
        //return 0.5;
      });

    // map hierachy to tree layout
    const treeNodes = tree(nodes);

    // add links between nodes
    const link = svg
      .selectAll("path.link")
      .data(nodes.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", elbow);

    // Style nodes
    const node = svg
      .selectAll("g.horse")
      .data(treeNodes.descendants())
      .enter()
      .append("g")
      .attr("class", "horse")
      .attr("transform", d => {
        return `translate(${d.y},${d.x})`;
      });

    // horse name
    node
      .append("text")
      .attr("x", -(boxWidth / 2.3 - flagwidth * 1.15))
      .attr("y", -flagheight * 0.25)
      .attr("text-anchor", "start")
      .attr("style", `font-size:${textSize}px`)
      
      .attr("class", "name")
      .text(d => {
        return d.data.name_and_origin;
      });

    // horse image
    node
      .append("image")
      .attr("x", -(boxWidth / 2.3))
      .attr("y", -flagheight)
      .attr("height", flagheight)
      .attr("width", flagwidth)
      .attr("xlink:href", d => {
        return `flags/4x3/${getOrigin(d.data)}.svg`;
      });

    // horse id
    node
      .append("text")
      .attr("dx", -(boxWidth / 2.3))
      .attr("dy", flagheight * 0.8)
      .attr("text-anchor", "start")
      .attr("style", `font-size:${textSize}px`)
      .attr("class", "id")
      .text(d => (isRoot(d.data) ? "" : d.data.id));
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.pedigree {
  width: 100%;
  svg {
    margin: 0px !important;
  }
  rect {
    stroke: lime;
    fill: lightgray;
    fill-opacity: 0.2;
  }
  .svg-tooltip {
    pointer-events: none;
  }
  .tooltip {
    padding: 10px;
    color: #4a22ff;
  }
  .link {
    fill: none;
    stroke: lightgray;
    stroke-width: 1px;
  }
}
</style>
