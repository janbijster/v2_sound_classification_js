<template>
  <div :class="`${classes}-wrapper`">
    <div :class="`${classes}__player`">
      <a title="Stop" @click="stop()"><stop class="color-blue"/></a>
      <a title="Play" @click="pause()">
        <play :class="['color-blue', paused ? '' : 'op-50']" />
      </a>
      <div
        :class="`${classes}__playback-time-wrapper`"
        title="Time played : Total time"
        @click="setPosition"
      >
        <div
          :style="progressStyle"
          :class="`${classes}__playback-time-indicator`"
        ></div>
        <div :class="`${classes}__time-display`">
          <span :class="`${classes}__playback-time-current`">{{
            currentTime
          }}</span>
          <span :class="`${classes}__playback-time-separator`"></span>
          <span :class="`${classes}__playback-time-total`">{{ duration }}</span>
        </div>
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
    height: 30px;
    line-height: 30px;

    a {
      cursor: pointer;
      display: inline-block;
      vertical-align: middle;
    }

    .#{$prefixCls}__extern-wrapper {
      display: inline-block;
      margin-left: 10px;

      > a {
        margin-right: 5px;
        vertical-align: 0;
      }

      .volume-toggle {
        position: relative;

        .volume-slider {
          cursor: pointer;
          position: absolute;
          top: 0;
          width: 80px;
          left: 24px;
        }
      }
    }

    .#{$prefixCls}__playback-time-wrapper {
      background: transparent;
      position: relative;
      width: 100px;
      display: inline-block;
      background: $blue-almost-white;
      height: 3px;
      cursor: pointer;
      margin-bottom: 9px;
      vertical-align: middle;

      .#{$prefixCls}__playback-time-separator::after {
        content: ' : ';
      }

      .#{$prefixCls}__playback-time-total {
      }

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
