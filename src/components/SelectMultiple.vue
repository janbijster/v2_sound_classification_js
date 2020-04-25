<template>
  <div :class="['select-multiple', adjustable ? 'adjustable' : 'static']">
    <div v-if="label && label != ''" class="select-multiple-label">
      {{ label }}
      <span class="op-50">({{ localSelected.length }}/{{ items.length }})</span>
    </div>
    <div
      v-for="(item, index) in items"
      :key="index"
      :class="['select-multiple-item', isSelected(item) ? 'selected' : '']"
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
      // items is assumed to be an array with objects, each object has a 'value' key and a 'name' (or other displayProperty)
      type: Array,
      default: () => []
    },
    displayProperty: {
      type: String,
      default: 'name'
    },
    selected: {
      // selected is assumed to be an array containing only values. So is the array passed along with the 'change' event
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
    isSelected(toggleItem) {
      return this.localSelected.some(
        selectedValue => toggleItem.value == selectedValue
      )
    },
    toggle(toggleItem) {
      if (!this.adjustable) return
      if (this.isSelected(toggleItem)) {
        this.localSelected = this.localSelected.filter(
          selectedValue => selectedValue != toggleItem.value
        )
      } else {
        this.localSelected.push(toggleItem.value)
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
.select-multiple.static {
  background-color: rgba(255, 255, 255, 0.5);
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
