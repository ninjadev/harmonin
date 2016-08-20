'use strict';

var BaseUI = require('./BaseUI');
var Knob = require('./Knob');

class OsirisUI extends BaseUI {
  constructor(channel) {
    super(channel);
    this.domElement = document.createElement('div');
    this.domElement.classList.add('osiris-container');
    this.domElement.classList.add('channel-container');
    this.domElement.innerHTML = `
    <div class="name">
      Osiris Soft Synth <span class="patch-name">${channel.settings.name}</span>
    </div>
    <div class="filter-frequency">
      Filter frequency
    </div>
    <div class="active-notes">
    </div>
    `;
    this.UI = {
      activeNotes:
        this.domElement.querySelector('.active-notes'),
      filterFrequencyKnob: new Knob()
    };
    this.domElement.querySelector('.filter-frequency').appendChild(
      this.UI.filterFrequencyKnob.domElement);
    this.UI.filterFrequencyKnob.setValue(this.channel.filter.frequency.value / 21000);
    var that = this;
    this.UI.filterFrequencyKnob.callback = function() {
      that.channel.filter.frequency.value = this.value * 21000;
    };
  }

  update() {
    this.UI.activeNotes.innerText = this.channel.activeNotesCount;
  }
}

module.exports = OsirisUI;
