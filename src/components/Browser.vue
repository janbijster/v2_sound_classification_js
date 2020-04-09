<template>
  <div class="browser align-left">
    <div class="browser-labels">
      <div class="browser-content">
        <div class="browser-title b">labels</div>
        <div class="browser-scroll">
          <div
            :class="[
              'browser-list-item browser-label',
              selectedLabel == null ? 'selected' : ''
            ]"
            @click="selectedLabel = null"
          >
            <span>unlabeled ({{ soundsByLabel(null).length }})</span>
          </div>
          <div
            v-for="(label, index) in labels"
            :key="index"
            :class="[
              'browser-list-item browser-label',
              selectedLabel == label ? 'selected' : ''
            ]"
            @click="selectedLabel = label"
          >
            <span>{{ label }} ({{ soundsByLabel(label).length }})</span>
            <div
              class="browser-item-delete"
              @click="deleteLabel(label, $event)"
            >
              <close :size="12" />
            </div>
          </div>
        </div>
      </div>
      <div class="browser-bottom-btns">
        <div class="btn btn-sm" @click="newLabel">new label</div>
      </div>
    </div>
    <div class="browser-sounds">
      <div class="browser-content">
        <div class="browser-title b">sounds</div>
        <div class="browser-scroll">
          <div
            v-for="(sound, index) in sounds"
            :key="index"
            :class="[
              'browser-list-item browser-sound',
              selectedSound == sound ? 'selected' : ''
            ]"
            @click="selectSound(sound)"
          >
            <span class="op-50">{{ sound.datetime }}</span> {{ sound.name }}
            <div
              class="browser-item-delete"
              @click="deleteSound(sound, $event)"
            >
              <close :size="12" />
            </div>
          </div>
        </div>
      </div>
      <div class="browser-bottom-btns">
        <upload-sound-button btn-class="btn btn-sm" @sound="uploadSound" />
        <record-audio-button btn-class="btn btn-sm" @sound="uploadSound" />
      </div>
    </div>
  </div>
</template>

<script>
import UploadSoundButton from '@/components/UploadSoundButton'
import RecordAudioButton from '@/components/RecordAudioButton'
import Close from 'vue-material-design-icons/Close.vue'

export default {
  components: {
    UploadSoundButton,
    RecordAudioButton,
    Close
  },
  data() {
    return {
      selectedLabel: null
    }
  },
  computed: {
    labels() {
      return this.$store.getters['sounds/getLabels']
    },
    sounds() {
      return this.soundsByLabel(this.selectedLabel)
    },
    selectedSound() {
      return this.$store.getters['sounds/getSelectedSound']
    }
  },
  methods: {
    newLabel() {
      this.$store
        .dispatch('sounds/newLabel')
        .then(label => (this.selectedLabel = label || this.selectedLabel))
    },
    deleteLabel(label, event) {
      event.stopImmediatePropagation()
      this.$store.commit('sounds/deleteLabel', label)
      this.selectedLabel = null
    },
    uploadSound(sound) {
      this.$store.commit('sounds/addSound', {
        label: this.selectedLabel,
        ...sound
      })
    },
    recordSound() {
      console.log('record')
    },
    deleteSound(sound, event) {
      event.stopImmediatePropagation()
      this.$store.commit('sounds/deleteSound', sound)
    },
    soundsByLabel(label) {
      return this.$store.getters['sounds/getSoundsByLabel'](label)
    },
    selectSound(sound) {
      this.$store.commit('sounds/selectSound', sound)
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/style/variables.scss';

.browser {
  height: 100%;
  position: relative;
}
.browser-content {
  height: calc(100% - 2.5rem);
  position: relative;
}
.browser-bottom-btns {
  position: absolute;
  bottom: 0.5rem;
}

.browser-labels,
.browser-sounds {
  height: 100%;
  overflow: hidden;
  position: absolute;
  background-color: $blue-almost-white;
  padding: 0.5rem;
  border-radius: 3px;
}
.browser-labels {
  width: calc(33% - 0.5rem);
}
.browser-sounds {
  width: calc(67% - 0.5rem);
  left: calc(33% + 0.5rem);
}
.browser-labels > .scroll,
.browser-sounds > .scroll {
  height: calc(100% - 1rem);
  width: 100%;
  overflow-x: hidden;
  position: absolute;
  overflow-y: scroll;
}
.browser-item-delete {
  position: absolute;
  background-color: $blue-light;
  color: #fff;
  top: calc(0.5rem - 3px);
  right: 0px;
  border-radius: 3px;
  height: 12px;
  box-shadow: 0px 0px 2px 3px $blue-almost-white;
}
.browser-item-delete > span {
  line-height: 15px;
  vertical-align: top;
}
.browser-list-item {
  cursor: pointer;
  height: 1.3rem;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}
.browser-list-item.selected {
  color: $blue;
}
.browser-scroll {
  height: calc(100% - 2rem);
  overflow-x: hidden;
  overflow-y: scroll;
  margin-top: 0.5rem;
}
</style>
