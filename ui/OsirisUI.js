'use strict';

var BaseUI = require('./BaseUI');
var Knob = require('./Knob');
var EnvelopeUI = require('./EnvelopeUI');

class OscillatorSettingsUI {
  constructor(settings) {
    this.domElement = document.createElement('div');
    this.domElement.classList.add('oscillatorsettings-container');
    this.domElement.classList.add('base-panel');
    this.domElement.innerHTML = `
      <div class="oscillatorsettings-name">${settings.name}</div>
    `;
    this.pitch = new Knob({
      name: 'Pitch',
      audioParam: settings.oscillatorSettings.pitch,
      mapping: 'linear',
      min: -12,
      max: 12
    });
    this.domElement.appendChild(this.pitch.domElement);
  }

  update() {
    this.pitch.update();
  }
}

class OsirisUI extends BaseUI {
  constructor(channel) {
    super(channel);
    this.name = 'Osiris Soft Synth';
    this.renderDOM();
    this.osirisKnobs = [
      new Knob({
        name: 'Portamento',
        audioParam: channel.portamentoTime,
        mapping: 'linear',
        min: 0,
        max: 1000
      }),
      new Knob({
        name: 'Vibrato frq.',
        audioParam: channel.vibratoFrequency,
        mapping: 'square',
        min: 0,
        max: 100
      }),
      new Knob({
        name: 'Vibrato amount',
        audioParam: channel.vibratoAmount,
        mapping: 'square',
        min: 0,
        max: 12
      })
    ];
    for(var knob of this.osirisKnobs) {
      this.domElement.appendChild(knob.domElement);
    }
    this.envelopeUI = new EnvelopeUI({
      name: 'Volume envelope',
      envelope: channel.envelope
    });
    this.filterEnvelopeUI = new EnvelopeUI({
      name: 'Filter envelope',
      envelope: channel.filterEnvelope
    });
    this.domElement.appendChild(this.envelopeUI.domElement);
    this.domElement.appendChild(this.filterEnvelopeUI.domElement);
    this.oscillatorSettingsUIs = [];
    for(var i = 0; i < 3; i++) {
      var oscillatorSettingsUI = new OscillatorSettingsUI({
        name: 'Oscillator ' + (i + 1),
        oscillatorSettings: this.channel.oscillatorSettings[i]
      });
      this.oscillatorSettingsUIs.push(oscillatorSettingsUI);
      this.domElement.appendChild(oscillatorSettingsUI.domElement);
    }
  }

  update() {
    super.update();
    this.envelopeUI.update();
    this.filterEnvelopeUI.update();
    for(var oscillatorSettingsUI of this.oscillatorSettingsUIs) {
      oscillatorSettingsUI.update();
    }
    for(var knob of this.osirisKnobs) {
      knob.update();
    }
  }
}

module.exports = OsirisUI;
