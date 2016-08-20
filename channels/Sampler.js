'use strict';

var BaseChannel = require('./BaseChannel');

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

module.exports = Sampler;
