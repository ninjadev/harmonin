'use strict';

class Knob {
  constructor(settings) {
    this.settings = settings;
    this.audioParam = settings.audioParam;

    function normalizeLinear(denormalizedValue) {
      var delta = settings.max - settings.min;
      return (denormalizedValue - settings.min) / delta;
    }
    function denormalizeLinear(normalizedValue) {
      var delta = settings.max - settings.min;
      return normalizedValue * delta + settings.min;
    }
    function normalizeSquare(denormalizedValue) {
      return Math.pow(normalizeLinear(denormalizedValue), .5);
    }
    function denormalizeSquare(normalizedValue) {
      return denormalizeLinear(Math.pow(normalizedValue, 2));
    }
    this.denormalizeValue = {
      linear: denormalizeLinear,
      square: denormalizeSquare
    }[settings.mapping];
    this.normalizeValue = {
      linear: normalizeLinear,
      square: normalizeSquare
    }[settings.mapping];
    this.value = 0;
    this.domElement = document.createElement('div');
    this.domElement.classList.add('knob-container');
    this.domElement.innerHTML = `
      <div class="knob">
        <input min="0", max="1">
        <svg viewBox='0 0 50 50'>
          <circle cx='25' cy='25' r='23' />
        </svg>
      </div>
      <div class="knob-name">
        ${settings.name}
      </div>
    `;

    this.UI = {
      input: this.domElement.querySelector('input'),
      circle: this.domElement.querySelector('circle')
    };

    var that = this;
    this.dragging = false;
    this.startValue = 0;
    this.dragOffset = 0;
    this.domElement.addEventListener('mousedown', function(e) {
      that.dragging = true;
      that.startValue = that.value;
      that.dragOffset = e.clientY;
      e.preventDefault();
    });
    document.body.addEventListener('mouseup', function() {
      that.dragging = false;
    });

    document.body.addEventListener('mousemove', function(e) {
      if(that.dragging) {
        var shouldUpdateAudioParam = true;
        that.setValue(
          that.startValue + (that.dragOffset - e.clientY) / 127,
          shouldUpdateAudioParam);
      }
    });
  }

  setDenormalizedValue(denormalizedValue) {
    this.setValue(this.normalizeValue(denormalizedValue));
  }

  setValue(value, shouldUpdateAudioParam) {
    value = Math.max(0, value);
    value = Math.min(1, value);
    value = (value * 127 | 0) / 127;
    this.value = value;
    if(this.settings.max > 127 || this.settings.min < -127) {
      this.UI.input.value = (this.denormalizeValue(value) | 0);
    } else {
      this.UI.input.value = (this.denormalizeValue(value) * 100 | 0) / 100;
    }
    this.UI.circle.style.strokeDashoffset = (1 - value) * 157 | 0;
    if(shouldUpdateAudioParam) {
      this.audioParam.value = this.denormalizeValue(value);
    }
  }

  update() {
    if(!this.dragging) {
      this.setDenormalizedValue(this.audioParam.value);
    }
  }
}

module.exports = Knob;
