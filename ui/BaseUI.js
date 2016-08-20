'use strict';

var Knob = require('./Knob');

class BaseUI {
  constructor(channel) {
    this.channel = channel;

    this.knobs = {
      volume: new Knob({
        name: 'Volume',
        audioParam: this.channel.outputNode.gain,
        mapping: 'linear',
        min: 0,
        max: 1
      }),
      reverb: new Knob({
        name: 'Reverb',
        audioParam: this.channel.reverbSendNode.gain,
        mapping: 'linear',
        min: 0,
        max: 1
      }),
      filter: new Knob({
        name: 'Filter frq.',
        audioParam: this.channel.filter.frequency,
        mapping: 'square',
        min: 0,
        max: 21000
      }),
      delayTime: new Knob({
        name: 'Delay time',
        audioParam: this.channel.delay.delayTime,
        mapping: 'linear',
        min: 0,
        max: 1
      }),
      delayAmount: new Knob({
        name: 'Delay amount',
        audioParam: this.channel.delayGain.gain,
        mapping: 'linear',
        min: 0,
        max: 1
      })
    }
    var that = this;
  }

  renderDOM() {
    this.domElement = document.createElement('div');
    this.domElement.classList.add('channel-container');
    this.domElement.innerHTML = `
    <div class="name">
      ${this.name} <span class="patch-name">${this.channel.settings.name}</span>
    </div>
    <div class="base-panel">
    </div>
    `;
    var basePanel = this.domElement.querySelector('.base-panel');
    basePanel.appendChild(this.knobs.volume.domElement);
    basePanel.appendChild(this.knobs.reverb.domElement);
    basePanel.appendChild(this.knobs.filter.domElement);
    basePanel.appendChild(this.knobs.delayTime.domElement);
    basePanel.appendChild(this.knobs.delayAmount.domElement);
  }

  update() {
    if(!this.knobs.volume.dragging) {
      this.knobs.volume.setDenormalizedValue(this.channel.outputNode.gain.value);
    }
    if(!this.knobs.reverb.dragging) {
      this.knobs.reverb.setDenormalizedValue(this.channel.reverbSendNode.gain.value);
    }
    if(!this.knobs.filter.dragging) {
      this.knobs.filter.setDenormalizedValue(this.channel.filter.frequency.value);
    }
    if(!this.knobs.delayTime.dragging) {
      this.knobs.delayTime.setDenormalizedValue(this.channel.delay.delayTime.value);
    }
    if(!this.knobs.delayAmount.dragging) {
      this.knobs.delayAmount.setDenormalizedValue(this.channel.delayGain.gain.value);
    }
  }
}

module.exports = BaseUI;
