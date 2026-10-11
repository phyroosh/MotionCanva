import {makeProject} from '@motion-canvas/core';
import scene from '../scenes/short_showcase?scene';
import audio from '../audio.mp3';

export default makeProject({
  scenes: [scene],
  audio,
});
