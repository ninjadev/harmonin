'use strict';

var Parameter = require('../utils/Parameter.js');
var Knob = require('./Knob.js');

class EnvelopeUI {
  constructor(settings) {
    this.envelope = settings.envelope;
    this.domElement = document.createElement('div');
    this.domElement.classList.add('envelope-container');
    this.domElement.classList.add('base-panel');
    this.domElement.innerHTML = `
      <div class="envelope-name">${settings.name}</div>
    `;
    this.knobs = [
      new Knob({
        name: 'Delay',
        audioParam: this.envelope.delay,
        mapping: 'linear',
        min: 0,
        max: 1000
      }),
      new Knob({
        name: 'Attack',
        audioParam: this.envelope.attack,
        mapping: 'linear',
        min: 0,
        max: 1000
      }),
      new Knob({
        name: 'Hold',
        audioParam: this.envelope.hold,
        mapping: 'linear',
        min: 0,
        max: 1000
      }),
      new Knob({
        name: 'Decay',
        audioParam: this.envelope.decay,
        mapping: 'linear',
        min: 0,
        max: 1000
      }),
      new Knob({
        name: 'Sustain',
        audioParam: this.envelope.sustain,
        mapping: 'linear',
        min: 0,
        max: 1
      }),
      new Knob({
        name: 'Release',
        audioParam: this.envelope.release,
        mapping: 'linear',
        min: 0,
        max: 1000
      })
    ];
    for(var knob of this.knobs) {
      this.domElement.appendChild(knob.domElement);
    }
  }

  update() {
    for(var knob of this.knobs) {
      knob.update();
    }
  }
}

module.exports = EnvelopeUI;
