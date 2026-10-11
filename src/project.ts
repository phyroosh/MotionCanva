import {makeProject} from '@motion-canvas/core';
import goodVsBadStress from './scenes/good_vs_bad_stress?scene';
import shortShowcase from './scenes/short_showcase?scene';
import showcase from './scenes/showcase?scene';
import audio from './audio.mp3';

export default makeProject({
  scenes: [goodVsBadStress, shortShowcase, showcase],
  audio,
});
