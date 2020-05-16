<template>
  <div class="about">
    <div class="view-title h4">About</div>
    <p>
      Sound classification in the browser.<br />
      Developed by Jan Bijster for V2 institute for unstable media, Rotterdam
      2020.
    </p>
    <p>
      <a
        href="https://github.com/janbijster/v2_sound_classification_js"
        target="_blank"
        >View source code on Github</a
      >
    </p>
    <p><b>Usage</b></p>
    <p>
      <ol>
        <li>Import or record sounds categorized by two or more different labels in the <router-link to="sounds">sounds tab</router-link>.</li>
        <li><router-link to="preprocess">Preprocess</router-link> the sounds to generate visual spectrograms for learning.</li>
        <li>Create and train a model in the <router-link to="models">models tab</router-link> to predict labels for sounds. Then use the model on uploaded or recorded sounds.</li>
      </ol>
    </p>
    <p><b>Feedback</b></p>
    <p>
      Questions, feedback, anything else? Send it to <a href="mailto:info@janbijster.com">info@janbijster.com</a>
    </p>
  </div>
</template>

<style scoped>
.about {
  text-align: left;
}
</style>
