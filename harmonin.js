(function() {
  'use strict';

  var audioContext = new AudioContext();

  var channels = [
    new Osiris(audioContext),
    new Osiris(audioContext),
    new Osiris(audioContext)
  ]

  for(var channel of channels) {
    channel.outputNode.connect(audioContext.destination);
  }

  navigator.requestMIDIAccess({}).then(function(midiAccess) {
    var midi = midiAccess;

    for(var input of midi.inputs.values()) {
      console.log(input); 
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
        }
      });
    }

  }, function(e) {
    console.log(e);  
  })
})();

