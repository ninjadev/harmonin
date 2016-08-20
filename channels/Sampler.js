(function(global) {
  'use strict';

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

  class Sampler extends BaseChannel {
    constructor(audioContext, settings) {
      super(audioContext, settings);
      var request = new XMLHttpRequest();
      request.open('GET', settings.filename, true);
      request.responseType = 'arraybuffer';
      var that = this;
      request.onload = function() {
        that.audioContext.decodeAudioData(request.response, function(buffer) {
          that.audioBuffer = buffer;
          that.__UI.UI.loadingStatus.innerText = 'Ready.';
        },
        function(e){console.log(e)});
      }
      request.send();
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
  }

  global.Sampler = Sampler;
  global.SamplerUI = SamplerUI;
})(this);
