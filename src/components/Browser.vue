<template>
  <div class="browser text-left">
    <div class="browser-labels">
      <div class="browser-content">
        <div class="browser-title b">labels</div>
        <item-list
          :items="labelObjects"
          :selected-item="labelObjectByValue(selectedLabel)"
          @select="labelObject => (selectedLabel = labelObject.value)"
          @delete="labelObject => deleteLabel(labelObject.value)"
        />
      </div>
      <div class="browser-bottom-btns">
        <div class="btn btn-sm" @click="newLabel">new label</div>
      </div>
    </div>
    <div class="browser-sounds">
      <div class="browser-content">
        <div class="browser-title b">sounds</div>
        <item-list
          :items="sounds"
          :selected-item="selectedSound"
          @select="selectSound"
          @delete="deleteSound"
        />
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
import ItemList from '@/components/ItemList'

const nullLabelObject = { name: 'unlabeled', value: null }

export default {
  components: {
    UploadSoundButton,
    RecordAudioButton,
    ItemList
  },
  data() {
    return {
      selectedLabel: nullLabelObject.value
    }
  },
  computed: {
    labelObjects() {
      return [
        nullLabelObject,
        ...this.$store.getters['sounds/getLabels'].map(label => ({
          name: label,
          value: label
        }))
      ]
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
    deleteLabel(label) {
      this.$store.commit('sounds/deleteLabel', label)
      this.selectedLabel = null
    },
    labelObjectByValue(label) {
      return (
        this.labelObjects.find(labelObject => labelObject.value == label) ||
        nullLabelObject
      )
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
    deleteSound(sound) {
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
.browser-scroll {
  height: calc(100% - 2rem);
  overflow-x: hidden;
  overflow-y: scroll;
  margin-top: 0.5rem;
}
</style>
