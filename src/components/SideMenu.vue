<template>
  <div class="side-menu color-off-white">
    <div class="side-menu-button op-50" @click="collapsed = !collapsed">
      <menu-icon v-if="collapsed" class="menu-icon" />
      <close-icon v-if="!collapsed" class="close-icon" />
    </div>
    <div class="side-menu-window theme-blue" :style="windowStyle">
      <div class="side-menu-header">
        Sound classification js
      </div>
      <div class="side-menu-links">
        <router-link
          v-for="(link, index) in allLinks"
          :key="index"
          :to="link.path"
          class="menu-link"
          @click.native="collapsed = true"
          >{{ link.name }}</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
import MenuIcon from 'vue-material-design-icons/Menu.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'

export default {
  components: {
    MenuIcon,
    CloseIcon
  },
  data() {
    return {
      menuWidth: 70,
      collapsed: true,
      allLinks: this.$router.options.routes
    }
  },
  computed: {
    windowStyle() {
      return {
        left: this.collapsed ? `-${this.menuWidth}vw` : '0',
        right: this.collapsed ? '100vw' : `${100 - this.menuWidth}vw`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/variables.scss';

.side-menu {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  pointer-events: none;
}

.side-menu-button {
  position: absolute;
  z-index: 101;
  left: 1rem;
  top: 1rem;
  transition: opacity 0.2s ease;
  pointer-events: auto;
}

.menu-icon {
  color: $blue-light;
}

.side-menu-window {
  position: absolute;
  top: 0;
  bottom: 0;
  padding: 1rem;
  transition: left 0.3s ease, right 0.3s ease;
  pointer-events: auto;
}
.side-menu-header {
  margin-left: 2.5rem;
  margin-bottom: 1rem;
}

.side-menu-links {
  margin-top: 3rem;
}
.menu-link {
  margin-left: 2.5rem;
  display: block;
  margin-bottom: 1rem;
}
</style>
