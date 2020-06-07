<template>
  <div class="item-list scroll">
    <div
      v-for="(item, index) in items"
      :key="index"
      :class="[
        'item-list-item',
        selectedItem == item ? 'selected' : 'not-selected'
      ]"
      @click="selectItem(item)"
    >
      {{ item[displayProperty] }}
      <div
        v-if="!item.noDelete"
        class="item-delete"
        @click="deleteItem(item, $event)"
      >
        <close :size="12" />
      </div>
    </div>
  </div>
</template>

<script>
import Close from 'vue-material-design-icons/Close.vue'

export default {
  components: {
    Close
  },
  props: {
    items: {
      type: Array,
      default: () => []
    },
    selectedItem: {
      type: Object,
      default: null
    },
    displayProperty: {
      type: String,
      default: 'name'
    }
  },
  methods: {
    selectItem(item) {
      if (this.selectedItem != item) {
        this.$emit('select', item)
      }
    },
    deleteItem(item, event) {
      console.log(event)
      event.stopImmediatePropagation()
      this.$emit('delete', item)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/variables.scss';

.item-list.scroll {
  height: calc(100% - 2rem);
  overflow-x: hidden;
  overflow-y: scroll;
  margin-top: 0.5rem;
}
.item-delete {
  position: absolute;
  background-color: $blue-light;
  color: #fff;
  top: calc(0.5rem - 3px);
  right: 3px;
  border-radius: 3px;
  height: 12px;
}
.item-delete > span {
  line-height: 15px;
  vertical-align: top;
}
.item-delete > span > svg {
  vertical-align: text-top;
}
.item-list-item {
  height: 1.3rem;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}
.item-list-item.selected {
  cursor: default;
  color: $blue;
  background: $white;
  border-radius: 3px;
}
.item-list-item.not-selected {
  cursor: pointer;
}
</style>
