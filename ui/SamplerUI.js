'use strict';

var BaseUI = require('../ui/BaseUI');

class SamplerUI extends BaseUI {
  constructor(channel) {
    super(channel);
    this.name = 'Sampler';
    this.renderDOM();
  }
}

module.exports = SamplerUI;
