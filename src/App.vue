<template>
  <div id="app">
    <side-menu />
    <status-message />
    <router-view class="router-content" />
  </div>
</template>

<script>
import SideMenu from '@/components/SideMenu.vue'
import StatusMessage from '@/components/StatusMessage'

export default {
  name: 'Home',
  components: {
    SideMenu,
    StatusMessage
  },
  mounted() {
    this.$store.dispatch('loadAll')
    // this.$store.dispatch('sounds/loadAll')
    // this.$store.dispatch('models/loadAll')
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
