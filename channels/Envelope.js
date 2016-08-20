(function(global) {
  'use strict';

  function clamp(a, v, b) {
    return Math.min(b, Math.max(v, a));
  }

  function finitize(v) {
    return (v * 1e5 | 0) / 1e5;
  }

  function lerp(a, b, t) {
    t = clamp(0, t, 1);
    return finitize(b * t + a * (1 - t));
  } 

  class Envelope {
    constructor(settings) {
      this.delay = settings.delay;
      this.attack = settings.attack;
      this.hold = settings.hold;
      this.decay = settings.decay;
      this.sustain = settings.sustain;
      this.release = settings.release;
    }

    getValue(time, releaseTime) {
      var value = 0;
      var releaseAmount = 0;
      if(releaseTime >= 0) {
        releaseAmount = 1000 * releaseTime / this.release;
        time = time - releaseTime;
      }
      time *= 1000;
      if(time < this.delay) {
        value = 0;
        return lerp(value, 0, releaseAmount);
      }
      time -= this.delay;
      if(time < this.attack) {
        value = lerp(0, 1, time / this.attack);
        return lerp(value, 0, releaseAmount);
      }
      time -= this.attack;
      if(time < this.hold) {
        value = 1;
        return lerp(value, 0, releaseAmount);
      }
      time -= this.hold;
      value = lerp(1, this.sustain, time / this.decay);
      return lerp(value, 0, releaseAmount);
    }
  }

  global.Envelope = Envelope;
})(this);
