<template>
  <div class="upload-file-component">
    <div class="upload-btn-wrapper">
      <div :class="btnClass" @click="clickFileUpload">
        {{ btnText }}
      </div>
      <input
        ref="input"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="handleFiles()"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    accept: {
      type: String,
      default: 'audio/*'
    },
    multiple: {
      type: Boolean,
      default: true
    },
    btnClass: {
      type: String,
      default: 'btn'
    },
    btnText: {
      type: String,
      default: 'upload'
    }
  },
  data() {
    return {}
  },
  methods: {
    handleFiles() {
      const inputElement = this.$refs['input']
      if (inputElement.files == null || inputElement.files.length < 1) {
        return
      }
      this.$emit('files', inputElement.files)
    },
    clickFileUpload() {
      const inputElement = this.$refs['input']
      inputElement.click()
    }
  }
}
</script>

<style scoped>
.upload-file-component {
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
