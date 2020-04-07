<template>
  <div class="browser align-left">
    <div class="browser-content">
      <div class="browser-labels">
        <div class="browser-title b">labels</div>
        <div class="scroll">
          <div :class="['browser-list-item browser-label', selectedLabel == null ? 'b' : '']">
            <span class="op-50" @click="selectedLabel = null">unlabeled ({{ soundsByLabel(null).length }})</span>
          </div>
          <div
            v-for="(label, index) in labels" :key="index"
            :class="['browser-list-item browser-label', selectedLabel == label ? 'b' : '']"
          > 
            <div class="browser-item-delete b" @click="deleteLabel(label)">x</div>
            <span @click="selectedLabel = label">{{ label }} ({{ soundsByLabel(label).length }})</span>
          </div>
          <div class="btn btn-sm" @click="newLabel">new label</div>
        </div>
      </div>
      <div class="browser-sounds">
        <div class="browser-title b">sounds</div>
        <div class="scroll">
          <div
            v-for="(sound, index) in sounds" :key="index"
            :class="['browser-list-item browser-sound', selectedSound == sound ? 'b' : '']"
            @click="selectSound(sound)"
          >
            <div class="browser-item-delete b" @click="deleteSound(sound)">x</div>
            {{ sound }}
          </div>
          <div class="btn btn-sm" @click="uploadSound">Upload</div>
          <div class="btn btn-sm" @click="recordSound">Record</div>
        </div>
      </div>
    </div>
    <div class="browser-buttons">
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      selectedLabel: null
    }
  },
  computed: {
    labels () {
      return this.$store.getters['sounds/getLabels']
    },
    sounds () {
      return this.soundsByLabel(this.selectedLabel)
    },
    selectedSound () {
      return this.$store.getters['sounds/getSelectedSound']
    }
  },
  methods: {
    newLabel () {
      this.$store.dispatch('sounds/newLabel').then(label => this.selectedLabel = label)
    },
    deleteLabel (label) {
      this.$store.commit('sounds/deleteLabel', label)
      this.selectedLabel = null
    },
    uploadSound () {
      this.$store.commit('sounds/addSound', { label: this.selectedLabel, file: 'todo' })
    },
    recordSound () {
      console.log('record')
    },
    deleteSound (sound) {
      this.$store.commit('sounds/deleteSound', sound)
    },
    soundsByLabel (label) {
      return this.$store.getters['sounds/getSoundsByLabel'](label)
    },
    selectSound (sound) {
      this.$store.commit('sounds/selectSound', sound)
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/style/variables.scss';

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

.browser-labels, .browser-sounds {
  height: 100%;
  overflow: hidden;
  position: absolute;
}
.browser-labels {
  width: 33%;
}
.browser-sounds {
  width: calc(66% - 1rem);
  left: calc(33% + 1rem);
}
.browser-labels>.scroll, .browser-sounds>.scroll {
  height: calc(100% - 1rem);
  width: 100%;
  overflow-x: hidden;
  position: absolute;
  overflow-y: scroll;
}
.browser-item-delete {
  float: right;
  margin-right: 0.3rem;
}
.browser-list-item {

}
</style>