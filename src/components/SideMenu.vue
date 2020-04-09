<template>
  <div class="side-menu color-off-white">
    <div class="side-menu-button" @click="collapsed = !collapsed">
      <menu-icon v-if="collapsed" class="menu-icon" />
      <close-icon v-if="!collapsed" class="close-icon" />
    </div>
    <div class="side-menu-window theme-blue" :style="windowStyle">
      <div class="side-menu-header view-title h4">
        Sound classification js
      </div>
      <div class="side-menu-links">
        <router-link
          v-for="(link, index) in menuLinks"
          :key="index"
          :to="link"
          class="menu-link"
          @click.native="collapsed = true"
          >{{ link.name }}</router-link
        >
        <div class="side-menu-separator" />
        <div class="menu-link" @click="clearSounds">Clear all sounds</div>
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
      menuWidthVw: 70,
      maxMenuWidthPx: 500,
      minMenuWidthPx: 350,
      collapsed: true,
      windowWidthPx: 0
    }
  },
  computed: {
    windowStyle() {
      return {
        left: this.collapsed ? `-${this.menuWidthPx}px` : '0',
        right: this.collapsed
          ? '100vw'
          : `${this.windowWidthPx - this.menuWidthPx}px`
      }
    },
    menuWidthPx() {
      const menuWidth = Math.min(
        this.menuWidthVw * 1e-2 * this.windowWidthPx,
        this.maxMenuWidthPx
      )
      return menuWidth < this.minMenuWidthPx
        ? Math.min(this.windowWidthPx, this.minMenuWidthPx)
        : menuWidth
    },
    menuLinks() {
      return this.$router.options.routes.filter(link => link.showInMenu)
    }
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener('resize', this.getWindowWidth)
      this.getWindowWidth()
    })
  },
  destroyed() {
    window.removeEventListener('resize', this.getWindowWidth)
  },
  methods: {
    getWindowWidth() {
      this.windowWidthPx = document.documentElement.clientWidth
    },
    clearSounds() {
      this.collapsed = true
      this.$store.dispatch('sounds/clearAll')
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
  left: calc(1rem - 2px);
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
  transition: left 0.15s ease, right 0.15s ease;
  pointer-events: auto;
}
.side-menu-header {
  margin-bottom: 1rem;
}

.side-menu-links {
  margin-top: 3rem;
}
.menu-link {
  margin-left: 28px;
  display: block;
  margin-bottom: 1rem;
}
.side-menu-separator {
  height: 2rem;
}
</style>
