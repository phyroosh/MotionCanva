import {makeProject} from '@motion-canvas/core';
import scene from '../scenes/good_vs_bad_stress?scene';
import audio from '../audio.mp3';

export default makeProject({
  scenes: [scene],
  audio,
});
