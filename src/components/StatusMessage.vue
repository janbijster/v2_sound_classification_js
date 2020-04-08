<template>
  <div :class="['status-message', message ? '' : 'no-message']">
    {{ message || 'all changes saved' }}
  </div>
</template>

<script>
export default {
  computed: {
    message() {
      return this.$store.getters['sounds/getDiskActivity']
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/variables';

.status-message {
  position: absolute;
  top: 1.25rem;
  right: 1rem;
  text-align: right;
  color: $blue-light;
}
.status-message.no-message {
  color: $blue-almost-white;
}
</style>
