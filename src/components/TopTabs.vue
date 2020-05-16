<template>
  <div class="top-tabs">
    <div
      v-for="(routeName, index) in tabs"
      :key="index"
      :class="['tab', $route.name == routeName ? 'active' : 'inactive']"
      @click="$route.name != routeName && $router.push({ name: routeName })"
    >
      {{ routeName }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabs: ['Sounds', 'Preprocess', 'Models'] // correspond to route names
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/variables.scss';

.top-tabs {
  position: relative;
  height: 1rem;
  margin-left: calc(28px - 0.25rem);
  text-align: left;
}
.tab {
  margin: -0.1rem 0 0;
  padding: 0.25rem 0.5rem;
  display: inline-block;
  background: rgba(0, 0, 0, 0);
}
.tab.active {
  font-weight: 700;
  color: $blue;
}
.tab.inactive {
  font-weight: 400;
  opacity: 0.5;
  cursor: pointer;
}
</style>
