'use strict';

class BaseChannel {
  constructor(audioContext, settings) {
    this.id = Math.random() * 1e9 | 0;
    this.audioContext = audioContext;
    this.outputNode = this.audioContext.createGain();
    this.reverbSendNode = this.audioContext.createGain();
    this.outputNode.connect(this.reverbSendNode);
    this.filter = this.audioContext.createBiquadFilter();
    this.filter.connect(this.outputNode);
    this.accumulator = this.filter;
    this.delay = this.audioContext.createDelay();
    this.delayGain = this.audioContext.createGain();
    this.filter.connect(this.delay);
    this.delay.connect(this.delayGain);
    this.delayGain.connect(this.delay);
    this.delayGain.connect(this.outputNode);
    this.loadPreset(settings);
  }

  loadPreset(settings) {
    this.settings = settings;
    this.outputNode.gain.value = settings.volume;
    this.reverbSendNode.gain.value = settings.reverb || 0;
    this.filter.type = settings.filterType;
    this.filter.frequency.value = settings.filterFrequency || 0;
    this.delay.delayTime.value = settings.delayTime || 0;
    this.delayGain.gain.value = settings.delayGain || 0;
  }

  tick(time) {
  }
  
  noteNumberToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
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
