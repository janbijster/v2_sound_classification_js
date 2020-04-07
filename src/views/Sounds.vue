<template>
  <div class="sounds">
    <div class="view-title h4">Sounds</div>
    <div class="vertical-split-holder">
      <vertical-split>
        <template v-slot:top>
          <browser />
        </template>
        <template v-slot:bottom>
          <sound-inspector />
        </template>
      </vertical-split>
    </div>
  </div>
</template>

<script>
import VerticalSplit from '@/components/VerticalSplit'
import Browser from '@/components/Browser'
import SoundInspector from '@/components/SoundInspector'

export default {
  name: 'Sounds',
  components: {
    VerticalSplit,
    Browser,
    SoundInspector
  }
}
</script>

<style scoped>
.sounds {
  padding-bottom: 1rem;
}
.vertical-split-holder {
  margin-top: 1rem;
  height: calc(100% - 2rem);
}
</style>
