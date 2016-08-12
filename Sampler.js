(function(global) {
  'use strict';

  class Sampler {
    constructor(audioContext, settings) {
      this.audioContext = audioContext;
      this.audioBuffer = settings.audioBuffer;
      this.outputNode = this.audioContext.createGain();
      this.outputNode.connect(this.audioContext.destination);
      this.outputNode.gain.value = 0.1 * settings.volume;

      this.domElement = document.createElement('div');
      this.domElement.classList.add('sampler-container');
      this.domElement.classList.add('channel-container');
      this.domElement.innerHTML = `
      <div class="name">
        Sampler <span class="patch-name">${settings.filename}</span>
      </div>
      <div class="loading-status">Loading...</div>
      `;

      this.UI = {
        loadingStatus: this.domElement.querySelector('.loading-status')
      }

      var request = new XMLHttpRequest();
      request.open('GET', settings.filename, true);
      request.responseType = 'arraybuffer';
      var that = this;
      request.onload = function() {
        that.audioContext.decodeAudioData(request.response, function(buffer) {
          that.audioBuffer = buffer;
          that.UI.loadingStatus.innerText = 'Ready.';
        },
        function(e){console.log(e)});
      }
      request.send();
    }

    tick(time) {
    }
    
    noteNumberToFrequency(note) {
      return 440 * Math.pow(2, (note - 60) / 12);
    }

    noteOn(note, velocity) {
      if(this.audioBuffer) {
        var source = this.audioContext.createBufferSource();
        var gain = this.audioContext.createGain();
        gain.gain.value = velocity / 127;
        gain.connect(this.outputNode);
        source.buffer = this.audioBuffer;
        source.playbackRate.value = this.noteNumberToFrequency(note) / 440;
        source.connect(gain);
        source.start();
      }
    }

    noteOff(note, velocity) {
    }

    mod(id, value) {
    }

    updateUI() {
    }
  }

  global.Sampler = Sampler;
})(this);
