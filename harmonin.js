'use strict';

var Osiris = require('./channels/Osiris');
var Sampler = require('./channels/Sampler')
var OsirisUI = require('./ui/OsirisUI');
var SamplerUI = require('./ui/SamplerUI');

var audioContext = new AudioContext();

var channels = [
  new Osiris(audioContext, require('./presets/osiris/ClubStonk')),
  new Osiris(audioContext, require('./presets/osiris/Mellosynth')),
  new Osiris(audioContext, require('./presets/osiris/WidePad')),
  new Osiris(audioContext, require('./presets/osiris/SquarePluck')),
  new Sampler(audioContext, {
    volume: 5,
    filename: 'data/kick.wav'
  }),
  new Sampler(audioContext, {
    volume: 10,
    filename: 'data/snare.wav'
  }),
  new Sampler(audioContext, {
    reverb: 0.25,
    volume: 1,
    filename: 'data/hihat.wav'
  }),
  new Sampler(audioContext, {
    reverb: .5,
    volume: 20,
    filename: 'data/crash.wav'
  })
]

var reverbNode = audioContext.createConvolver();
reverbNode.connect(audioContext.destination);
(function() {
  var request = new XMLHttpRequest();
  request.open('GET', 'data/irHall.ogg', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    audioContext.decodeAudioData(request.response, function(buffer) {
      reverbNode.buffer = buffer;
    },
    function(e){console.log(e)});
  }
  request.send();
})();

var channelToUIMapping = {
  Osiris: OsirisUI,
  Sampler: SamplerUI
};

var channelUIs = [];
for(var channel of channels) {
  var channelUI = new channelToUIMapping[channel.constructor.name](channel);
  document.body.appendChild(channelUI.domElement);
  channelUIs.push(channelUI);
}

for(var channel of channels) {
  channel.outputNode.connect(audioContext.destination);
  channel.reverbSendNode.connect(reverbNode);
}

var eventTimingLoopNode = audioContext.createScriptProcessor(256, 1, 1);
eventTimingLoopNode.connect(audioContext.destination);
var time = audioContext.currentTime;
var oldTime = time;
var deltaTime = 0;
eventTimingLoopNode.onaudioprocess = function() {
  time = audioContext.currentTime;
  deltaTime += time - oldTime;
  oldTime = time;
  var step = 256 / audioContext.sampleRate;
  while(deltaTime >= step) {
    deltaTime -= step;
    tick(time);
  }
};

function tick(time) {
  for(var channel of channels) {
    channel.tick(time);
  }
}

navigator.requestMIDIAccess({}).then(function(midiAccess) {
  var midi = midiAccess;

  for(var input of midi.inputs.values()) {
    input.addEventListener('midimessage', function(e) {
      var channel = e.data[0] & 0xf;
      var type = e.data[0] & 0xf0;
      var note = e.data[1];
      var velocity = e.data[2];

      switch(type) {
        case 144:
          channels[channel].noteOn(note, velocity);
          break;
        case 128:
          channels[channel].noteOff(note, velocity);
          break;
        case 176:
          channels[channel].mod(note, velocity);
          break;
      }
    });
  }

}, function(e) {
  console.log(e);  
})

function uiLoop() {
  for(channelUI of channelUIs) {
    channelUI.update();
  }
  requestAnimationFrame(uiLoop);
}
requestAnimationFrame(uiLoop);
