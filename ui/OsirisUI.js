'use strict';

var BaseUI = require('./BaseUI');
var Knob = require('./Knob');

class OsirisUI extends BaseUI {
  constructor(channel) {
    super(channel);
    this.name = 'Osiris Soft Synth';
    this.renderDOM();
  }
}

module.exports = OsirisUI;
