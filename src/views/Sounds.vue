<template>
  <div class="sounds">
    <top-tabs />
    <div class="vertical-split-holder">
      <vertical-split :fraction="0.6">
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
import TopTabs from '@/components/TopTabs.vue'

export default {
  name: 'Sounds',
  components: {
    VerticalSplit,
    Browser,
    SoundInspector,
    TopTabs
  }
}
</script>

<style scoped>
.sounds {
  padding-bottom: 1rem;
}
.vertical-split-holder {
  margin-top: 1rem;
  height: calc(100% - 3rem);
}
</style>
