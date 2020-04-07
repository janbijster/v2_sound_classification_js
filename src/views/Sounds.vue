<template>
  <div class="sounds">
    <div class="view-title h4">Sounds</div>
    <div class="vertical-split-holder">
      <vertical-split>
        <template v-slot:top>
          <browser />
        </template>
        <template v-slot:bottom>
          <p>Here comes the sound inspector</p>
        </template>
      </vertical-split>
    </div>
  </div>
</template>

<script>
import VerticalSplit from '@/components/VerticalSplit'
import Browser from '@/components/Browser'

export default {
  name: 'Sounds',
  components: {
    VerticalSplit,
    Browser
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