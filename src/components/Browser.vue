<template>
  <div class="browser align-left">
    <div class="browser-content">
      <div class="browser-labels">
        <div v-for="(label, index) in labels" :key="index" class="browser-label">
          {{ label }}
        </div>
      </div>
      <div class="browser-items">
        <div v-for="(item, index) in items" :key="index" class="browser-item">
          {{ item }}
        </div>
      </div>
    </div>
    <div class="browser-buttons">
      <div class="btn">Upload</div>
      <div class="btn">Record</div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dummyLabels: ['car horn', 'street music', 'siren', 'engine idling', 'drilling', 'tire screech'],
      dummyItems: [
        '03-04-2020 13:23 3s',
        '03-04-2020 21:36 23s',
        '03-04-2020 22:10 5s',
        '05-12-2020 14:36 14s',
        '05-04-2020 15:00 2s'
      ]
    }
  },
  computed: {
    labels () {
      return this.randomList(this.dummyLabels, 10)
    },
    items () {
      return this.randomList(this.dummyItems, 50)
    }
  },
  methods: {
    randomElement (items) {
      return items[Math.floor(Math.random() * items.length)]
    },
    randomList (items, size) {
      let output = []
      for (let i = 0; i < size; i++) {
        output.push(this.randomElement(items))
      }
      return output
    }
  }
}
</script>

<style>
.browser {
  height: 100%;
}
.browser-content {
  height: calc(100% - 3rem);
  position: relative;
}
.browser-buttons {
  margin-top: 0.5rem;
}

.browser-labels, .browser-items {
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  position: absolute;
}
.browser-labels {
  width: 33%;
}
.browser-items {
  width: calc(66% - 1rem);
  left: calc(33% + 1rem);
}
</style>