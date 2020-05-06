<template>
  <div class="upload-sound-component">
    <div class="upload-btn-wrapper">
      <div :class="btnClass" @click="clickFileUpload">
        upload
      </div>
      <input
        ref="input"
        type="file"
        accept="audio/*"
        :multiple="multiple"
        @change="handleFile()"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    btnClass: {
      type: String,
      default: 'btn'
    },
    multiple: {
      type: Boolean,
      default: true
    },
    returnDataUrl: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  },
  methods: {
    handleFile() {
      const inputElement = this.$refs['input']
      if (inputElement.files == null || inputElement.files.length < 1) {
        return
      }
      inputElement.files.forEach(file => {
        console.log('got file: ', file)
        if (!file.type.startsWith('audio/')) {
          console.log('not audio')
        } else {
          if (this.returnDataUrl) {
            this.loadSound(file)
          } else {
            this.$emit('sound', file)
          }
        }
      })
    },
    loadSound(file) {
      const reader = new FileReader()
      reader.onload = e => {
        this.$emit('sound', {
          name: file.name,
          type: file.type,
          file: e.target.result
        })
      }
      reader.readAsDataURL(file)
    },
    clickFileUpload() {
      const inputElement = this.$refs['input']
      inputElement.click()
    }
  }
}
</script>

<style scoped>
.upload-sound-component {
  display: inline-flex;
}

.upload-btn-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.btn-placeholder {
  border: none;
  color: white;
  background-color: #ccc;
  font-weight: bold;
  position: relative;
}

.upload-btn-wrapper input[type='file'] {
  font-size: 100px;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
}

.placeholder-icon {
  position: absolute;
  font-size: 40px;
  left: calc(50% - 20px);
  top: calc(50% - 20px);
}
</style>
