(function(global) {
  'use strict';

  class Knob {
    constructor() {
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
          that.setValue(that.startValue + (that.dragOffset - e.clientY) / 127);
        }
      });

      this.setValue(0);
    }

    setValue(value) {
      value = Math.max(0, value);
      value = Math.min(1, value);
      value = (value * 127 | 0) / 127;
      this.value = value; 
      this.UI.input.value = (value * 100 | 0) / 100;
      this.UI.circle.style.strokeDashoffset = (1 - value) * 157 | 0;
      if(this.callback) {
        this.callback(value);
      }
    }
  }

  global.Knob = Knob;
})(this);
