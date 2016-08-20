'use strict';

var Parameter = require('../utils/Parameter.js');

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
    if(!settings) {
      settings = {
        delay: 0,
        attack: 0,
        hold: 0,
        decay: 0,
        sustain: 1,
        release: 0,
        amount: 1,
        offset: 0
      };
    }
    this.delay = new Parameter(settings.delay);
    this.attack = new Parameter(settings.attack);
    this.hold = new Parameter(settings.hold);
    this.decay = new Parameter(settings.decay);
    this.sustain = new Parameter(settings.sustain);
    this.release = new Parameter(settings.release);
    this.amount = new Parameter(settings.amount);
    this.offset = new Parameter(settings.offset);
  }

  getValue(time, releaseTime) {
    var value = 0;
    var releaseAmount = 0;
    if(releaseTime >= 0) {
      releaseAmount = 1000 * releaseTime / this.release.value;
      time = time - releaseTime;
    }
    time *= 1000;
    if(time < this.delay.value) {
      value = this.offset.value;
      return lerp(value, 0, releaseAmount);
    }
    time -= this.delay.value;
    if(time < this.attack.value) {
      value = lerp(0, 1, time / this.attack.value) * this.amount.value + this.offset.value;
      return lerp(value, 0, releaseAmount);
    }
    time -= this.attack.value;
    if(time < this.hold.value) {
      value = this.amount.value;
      return lerp(value, 0, releaseAmount);
    }
    time -= this.hold.value;
    value = lerp(1, this.sustain.value, time / this.decay.value) * this.amount.value + this.offset.value;
    return lerp(value, 0, releaseAmount);
  }
}

module.exports = Envelope;
