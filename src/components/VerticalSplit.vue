<template>
  <div class="vertical-split">
    <div class="part top-part" :style="topPartStyle">
      <slot name="top" />
    </div>
    <div class="divider" :style="dividerStyle" />
    <div class="part bottom-part" :style="bottomPartStyle">
      <slot name="bottom" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    fraction: {
      default: 0.75,
      type: Number
    }
  },
  data() {
    return {
      dividerSizeRem: 1
    }
  },
  computed: {
    topPartStyle() {
      return {
        height: `calc(${100 * this.fraction}% - ${0.5 *
          this.dividerSizeRem}rem)`
      }
    },
    bottomPartStyle() {
      return {
        height: `calc(${100 * (1 - this.fraction)}% - ${0.5 *
          this.dividerSizeRem}rem)`
      }
    },
    dividerStyle() {
      return {
        height: `${this.dividerSizeRem}rem`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/variables.scss';

.vertical-split {
  position: relative;
  width: 100%;
  height: 100%;
}

.part {
  border-radius: 3px;
}
</style>
