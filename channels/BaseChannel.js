'use strict';

class BaseChannel {
  constructor(audioContext, settings) {
    this.settings = settings;
    this.audioContext = audioContext;
    this.outputNode = this.audioContext.createGain();
    this.outputNode.gain.value = 0.1 * settings.volume;
    this.reverbSendNode = this.audioContext.createGain();
    this.reverbSendNode.gain.value = settings.reverb || 0;
    this.outputNode.connect(this.reverbSendNode);
    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = settings.filterType;
    this.filter.frequency.value = settings.filterFrequency || 0;
    this.filter.connect(this.outputNode);

    if(settings.delay) {
      this.delay = this.audioContext.createDelay();
      this.delay.delayTime.value = settings.delay.time;
      this.delayGain = this.audioContext.createGain();
      this.delayGain.gain.value = settings.delay.feedback;
      this.filter.connect(this.delay);
      this.delay.connect(this.delayGain);
      this.delayGain.connect(this.delay);
      this.delayGain.connect(this.outputNode);
    }
  }

  tick(time) {
  }
  
  noteNumberToFrequency(note) {
    return 440 * Math.pow(2, (note - 60) / 12);
  }

  noteOn(note, velocity) {
  }

  noteOff(note, velocity) {
  }

  mod(id, value) {
  }

  updateUI() {
  }
}

module.exports = BaseChannel;
