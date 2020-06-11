<template>
  <div ref="output" class="terminal">
    <div class="mono" v-html="outputString"></div>
    <div class="terminal-end" />
  </div>
</template>

<script>
import imageUtils from '@/utils/imageUtils'

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
    firstLine() {
      return this.output.length > this.maxLines ? '(...)\n' : ''
    },
    outputString() {
      return (
        this.firstLine +
        this.output
          .slice(this.startIndex, this.endIndex)
          .map(this.formatOutputItem)
          .join('')
      )
    }
  },
  watch: {
    output() {
      const outputHolderEl = this.$refs['output']
      outputHolderEl.scrollTop = outputHolderEl.scrollHeight
    }
  },
  methods: {
    formatOutputItem(item) {
      if (typeof item == 'string') {
        return `<pre>${item}</pre>`
      } else {
        try {
          const dataUrl = imageUtils.createImageFromSpectrogram(item)
          return `<img src="${dataUrl}" />`
        } catch {
          return ''
        }
      }
    }
  }
}
</script>

<style lang="scss">
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

.terminal pre {
  margin: 0;
}
</style>
