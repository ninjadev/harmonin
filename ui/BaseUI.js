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
    for(var key in this.knobs) {
      this.knobs[key].update();
    }
  }
}

module.exports = BaseUI;
