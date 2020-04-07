<template>
  <div id="app">
    <side-menu />
    <router-view class="router-content" />
  </div>
</template>

<script>
import SideMenu from '@/components/SideMenu.vue'

export default {
  name: 'Home',
  components: {
    SideMenu
  },
  mounted () {
    this.$store.dispatch('sounds/loadAll')
  }
}
</script>

<style lang="scss">
@import '@/assets/style/main.scss';

html,
body,
#app {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
* {
  box-sizing: border-box;
}

.router-content {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  padding: 1rem;
  text-align: center;
}
</style>
