<template>
  <div :class="`${classes}-wrapper`">
    <div :class="`${classes}__player`">
      <div
        :class="`${classes}__playback-time-wrapper`"
        title="Time played : Total time"
        @click="setPosition"
      >
        <div
          :style="progressStyle"
          :class="`${classes}__playback-time-indicator`"
        ></div>
      </div>
      <div :class="`${classes}__player-controls`">
        <a title="Stop" @click="stop()"><stop class="color-blue"/></a>
        <a title="Play" @click="pause()">
          <play :class="['color-blue', paused ? '' : 'op-50']" />
        </a>
      </div>
      <div :class="`${classes}__time-display`">
        <span :class="`${classes}__playback-time-current`">{{
          currentTime
        }}</span>
        <span :class="`${classes}__playback-time-separator`"></span>
        <span :class="`${classes}__playback-time-total`">{{ duration }}</span>
      </div>
    </div>
    <audio
      :id="playerId"
      ref="audiofile"
      :loop="innerLoop"
      :src="file"
      preload="auto"
      style="display:none;"
    ></audio>
  </div>
</template>

<script src="./vueaudio.plugin.js"></script>

<style lang="scss" scoped>
@import '@/assets/style/variables.scss';

$prefixCls: 'vue-sound';
.#{$prefixCls}-wrapper {
  .#{$prefixCls}__player {
    height: 40px;
    line-height: 30px;
    margin-left: -6px;

    a {
      cursor: pointer;
      display: inline-block;
      vertical-align: text-top;
    }

    .#{$prefixCls}__time-display,
    .#{$prefixCls}__player-controls {
      display: inline-block;
    }

    .#{$prefixCls}__time-display {
      font-size: 12px;
      margin-left: 6px;
    }

    .#{$prefixCls}__playback-time-separator::after {
      content: ' / ';
    }

    .#{$prefixCls}__playback-time-wrapper {
      background: transparent;
      position: relative;
      width: 126px;
      display: block;
      background: $blue-almost-white;
      height: 3px;
      cursor: pointer;
      margin: 0.5rem 6px 0;
      vertical-align: middle;

      .#{$prefixCls}__playback-time-indicator {
        background: $blue-light;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
      }
    }
  }
}
</style>
