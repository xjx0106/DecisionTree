<template>
  <div id="app">
    <DecisionTree></DecisionTree>
  </div>
</template>

<script>
import DecisionTree from "./components/DecisionTree.vue";

export default {
  name: "App",
  components: {
    DecisionTree,
  },
};
</script>

<style>
#app {
  padding: 0px;
  margin: 0px;
  width: 100vw;
  height: 100vh;
}
</style>
