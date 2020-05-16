<template>
  <div ref="output" class="terminal">
    <pre class="mono">{{ outputString }}</pre>
    <div class="terminal-end" />
  </div>
</template>

<script>
export default {
  props: {
    output: {
      type: Array,
      default: () => []
    },
    maxLines: {
      type: Number,
      default: 100
    }
  },
  computed: {
    startIndex() {
      return Math.max(0, this.output.length - this.maxLines)
    },
    endIndex() {
      return Math.min(this.startIndex + this.maxLines, this.output.length)
    },
    outputString() {
      return this.output.slice(this.startIndex, this.endIndex).join('\n')
    }
  },
  watch: {
    output() {
      const outputHolderEl = this.$refs['output']
      outputHolderEl.scrollTop = outputHolderEl.scrollHeight
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/style/variables.scss';

.terminal {
  text-align: left;
  overflow-y: scroll;
  background: rgba(255, 255, 255, 0.5);
  padding: 0.5rem;
  color: $blue;
}
.terminal-end {
  height: 2rem;
}
</style>
