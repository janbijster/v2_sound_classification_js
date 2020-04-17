<template>
  <div :class="['select-multiple', adjustable ? 'adjustable' : 'static']">
    <div v-if="label && label != ''" class="select-multiple-label">
      {{ label }} ({{ localSelected.length }}/{{ items.length }})
    </div>
    <div
      v-for="(item, index) in items"
      :key="index"
      :class="[
        'select-multiple-item',
        localSelected.includes(item) ? 'selected' : ''
      ]"
      @click="toggle(item)"
    >
      {{ item[displayProperty] }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    displayProperty: {
      type: String,
      default: 'name'
    },
    selected: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: ''
    },
    adjustable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      localSelected: this.selected
    }
  },
  watch: {
    selected(value) {
      this.localSelected = value
    }
  },
  methods: {
    toggle(toggleItem) {
      if (!this.adjustable) return
      if (this.localSelected.includes(toggleItem)) {
        this.localSelected = this.localSelected.filter(
          item => item != toggleItem
        )
      } else {
        this.localSelected.push(toggleItem)
      }
      this.$emit('change', this.localSelected)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/variables.scss';

.select-multiple.adjustable {
  background-color: #fff;
}
.select-multiple {
  padding: 0.25rem;
  border-radius: 3px;
}
.select-multiple-label {
  margin-bottom: 0.5rem;
}
.adjustable .select-multiple-item {
  cursor: pointer;
}
.select-multiple-item {
  height: 1.3rem;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  opacity: 0.25;
  margin: 0.25rem;
  border-radius: 3px;
}
.select-multiple-item.selected {
  opacity: 1;
  color: $blue;
  background-color: $blue-almost-white;
}
</style>
