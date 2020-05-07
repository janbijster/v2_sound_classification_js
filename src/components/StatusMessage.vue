<template>
  <div :class="['status-message', message ? '' : 'no-message']">
    {{ message || standardMessage }}
  </div>
</template>

<script>
const packageVersion = PACKAGE_VERSION // eslint-disable-line

export default {
  computed: {
    message() {
      return this.$store.getters['sounds/getDiskActivity']
    },
    standardMessage() {
      return `v${packageVersion} all changes saved`
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
