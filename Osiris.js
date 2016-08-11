(function(global) {
  'use strict';

  class OscillatorSettings {
    constructor() {
        this.type = 'sine';
        this.pitch = 0;
        this.amplitude = 1;
    }
  }

  class Osiris {
    constructor(audioContext) {
      this.audioContext = audioContext;
      this.notes = [];
      this.outputNode = audioContext.createGain();
      this.outputNode.connect(audioContext.destination);
      this.outputNode.gain.value = 0.1;
      this.oscillatorSettings = [
        new OscillatorSettings(),
        new OscillatorSettings(),
        new OscillatorSettings()
      ];
      this.vibratoFrequency = 5;
    }
    
    noteNumberToFrequency(note) {
      return 440 * Math.pow(2, (note - 69) / 12);
    }

    noteOn(note, velocity) {
      this.noteOff(note, velocity);
      var oscillators = [];
      for(var settings of this.oscillatorSettings) {
        var oscillator = this.audioContext.createOscillator();
        oscillator.frequency.value = this.noteNumberToFrequency(
            note + settings.pitch);
        oscillator.type = settings.type;
        oscillator.connect(this.outputNode);
        oscillator.start(this.audioContext.currentTime);
        var vibratoOscillator = this.audioContext.createOscillator();
        vibratoOscillator.frequency.value = this.vibratoFrequency;
        vibratoOscillator.start(this.audioContext.currentTime);
        vibratoOscillator.connect(oscillator.frequency);
        oscillators.push(oscillator);
      }
      this.notes[note] = {
        oscillators: oscillators,
        note: note,
        velocity: velocity
      };
    }

    noteOff(note, velocity) {
      if(!this.notes[note]) {
        return;
      }
      for(var oscillator of this.notes[note].oscillators) {
        oscillator.stop(this.audioContext.currentTime);
      }
      delete this.notes[note];
    }

  }

  global.Osiris = Osiris;
})(this);
