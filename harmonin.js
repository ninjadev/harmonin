(function(global) {
  'use strict';

  var audioContext = new AudioContext();

  var channels = [
    new Osiris(audioContext, {
      reverb: 0.2,
      name: '90\'s chorder',
      vibratoFrequency: 0,
      volume: 2,
      portamentoTime: 100,
      filterType: 'lowpass',
      envelope: {
        delay: 0,
        attack: 0,
        hold: 0,
        decay: 0,
        sustain: 1,
        release: 300
      },
      filterEnvelope: {
        delay: 0,
        attack: 0,
        hold: 0,
        decay: 0,
        sustain: 1,
        release: 10
      },
      oscillator1: {
        type: 'square',
        pitch: -12
      },
      oscillator2: {
        type: 'square',
        pitch: 3.86
      },
      oscillator3: {
        type: 'square',
        pitch: -5
      }
    }),
    new Osiris(audioContext, {
      name: 'Vibrato saw pad',
      vibratoFrequency: 5,
      volume: 0.8,
      portamentoTime: 80,
      envelope: {
        delay: 0,
        attack: 40,
        hold: 0,
        decay: 80,
        sustain: 0.5,
        release: 1000
      },
      filterType: 'lowpass',
      filterFrequency: 5000,
      oscillator1: {
        type: 'sawtooth',
        pitch: 0
      },
      oscillator2: {
        type: 'sawtooth',
        pitch: 0.12
      },
      oscillator3: {
        type: 'sawtooth',
        pitch: -0.12
      },
      reverb: 1
    }),
    new Osiris(audioContext, {
      name: 'Stabbato pluck',
      vibratoFrequency: 140 / 60 * 2,
      volume: 1.2,
      portamentoTime: 0,
      delay: {
        time: 60 / 140 / 4 * 3,
        feedback: 0.3
      },
      envelope: {
        delay: 0,
        attack: 0,
        hold: 0,
        decay: 80,
        sustain: 0.3,
        release: 100
      },
      reverb: 0.5,
      filterType: 'lowpass',
      filterFrequency: 5000,
      oscillator1: {
        type: 'sawtooth',
        pitch: 0
      },
      oscillator2: {
        type: 'square',
        pitch: 0.12
      },
      oscillator3: {
        type: 'square',
        pitch: -0.12
      }
    }),
    new Sampler(audioContext, {
      volume: 5,
      filename: 'kick.wav'
    }),
    new Sampler(audioContext, {
      volume: 5,
      filename: 'snare.wav'
    })
  ]

  var reverbNode = audioContext.createConvolver();
  reverbNode.connect(audioContext.destination);
  (function() {
    var request = new XMLHttpRequest();
    request.open('GET', 'irHall.ogg', true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      audioContext.decodeAudioData(request.response, function(buffer) {
        reverbNode.buffer = buffer;
      },
      function(e){console.log(e)});
    }
    request.send();
  })();

  for(var channel of channels) {
    channel.__UI = new global[channel.constructor.name + 'UI'](channel);
    document.body.appendChild(channel.__UI.domElement);
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
        console.log('midimessage', e);
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
    requestAnimationFrame(uiLoop);
    for(channel of channels) {
      channel.__UI.update();
    }
  }
  requestAnimationFrame(uiLoop);
})(this);
