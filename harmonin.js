(function() {
  'use strict';

  var audioContext = new AudioContext();
  var notes = [];
  
  var gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0.1;


  function noteNumberToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  function noteOn(note, velocity) {
    noteOff(note, velocity);
    var oscillator = audioContext.createOscillator();
    oscillator.frequency.value = noteNumberToFrequency(note);
    oscillator.type = 'square';
    oscillator.connect(gainNode);
    oscillator.start(audioContext.currentTime);
    notes[note] = {
      oscillator: oscillator,
      note: note,
      velocity: velocity
    };
  }

  function noteOff(note, velocity) {
    if(!notes[note]) {
      return;
    }
    var oscillator = notes[note].oscillator;
    oscillator.stop(audioContext.currentTime);
    delete notes[note];
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
            noteOn(note, velocity);
            break;
          case 128:
            noteOff(note, velocity);
            break;
        }
      });
    }

  }, function(e) {
    console.log(e);  
  })

  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  canvas.width = 640;
  canvas.height = 360;

  function render() {
    requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = 0; i < notes.length; i++) {
      var note = notes[i];
      if(!note) {
        continue;
      }
      ctx.fillRect(0, note.note * 2, 640, 2);
    }
  }
  requestAnimationFrame(render);

})();

