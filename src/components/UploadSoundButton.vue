<template>
  <upload-file-button
    :multiple="multiple"
    :btn-class="btnClass"
    accept="audio/*"
    @files="handleFiles"
  />
</template>

<script>
import UploadFileButton from '@/components/UploadFileButton'

export default {
  components: {
    UploadFileButton
  },
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
  methods: {
    handleFiles(files) {
      files.forEach(file => {
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
    }
  }
}
</script>
