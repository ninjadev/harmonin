'use strict';

var BaseUI = require('../ui/BaseUI');

class SamplerUI extends BaseUI {
  constructor(channel) {
    super(channel);
    this.domElement = document.createElement('div');
    this.domElement.classList.add('sampler-container');
    this.domElement.classList.add('channel-container');
    this.domElement.innerHTML = `
    <div class="name">
      Sampler <span class="patch-name">${this.channel.settings.filename}</span>
    </div>
    <div class="loading-status">Loading...</div>
    `;

    this.UI = {
      loadingStatus: this.domElement.querySelector('.loading-status')
    };
  }
}

module.exports = SamplerUI;
