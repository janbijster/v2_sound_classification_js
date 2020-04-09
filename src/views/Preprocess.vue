<template>
  <div class="preprocess-view">
    <div class="view-title h4">Preprocess</div>
    <div class="box text-center">
      <div class="btn">preprocess all</div>
    </div>
    <preprocess-item class="preprocess-item" :sound="sound" />
  </div>
</template>

<script>
import PreprocessItem from '@/components/PreprocessItem'

export default {
  components: {
    PreprocessItem
  },
  computed: {
    sound() {
      return this.$store.getters['sounds/getSelectedSound']
    }
  }
}
</script>

<style>
.preprocess-item {
  height: calc(100% - 7rem);
}
</style>
