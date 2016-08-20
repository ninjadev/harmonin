'use strict';

var BaseUI = require('./BaseUI');
var Knob = require('./Knob');
var EnvelopeUI = require('./EnvelopeUI');

class OsirisUI extends BaseUI {
  constructor(channel) {
    super(channel);
    this.name = 'Osiris Soft Synth';
    this.renderDOM();
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
  }

  update() {
    super.update();
    this.envelopeUI.update();
    this.filterEnvelopeUI.update();
  }
}

module.exports = OsirisUI;
