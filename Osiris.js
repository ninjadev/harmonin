(function(global) {
  'use strict';

  function clamp(a, v, b) {
    return Math.min(b, Math.max(v, a));
  }

  function finitize(v) {
    return (v * 1e5 | 0) / 1e5;
  }

  function lerp(a, b, t) {
    t = clamp(0, t, 1);
    return finitize(b * t + a * (1 - t));
  } 

  class OscillatorSettings {
    constructor(settings) {
        this.type = settings.type;
        this.pitch = settings.pitch;
    }
  }

  class Osiris {
    constructor(audioContext, settings) {
      this.audioContext = audioContext;
      this.notes = [];
      for(var i = 0; i < 32; i++) {
        this.notes.push({
          startTime: -1,
          releaseTime: -1,
          oscillators: [],
          gain: null,
          note: 0,
          velocity: 0
        });
      }
      this.activeNotesCount = 0;
      this.outputNode = this.audioContext.createGain();
      this.outputNode.connect(this.audioContext.destination);
      this.outputNode.gain.value = 0.1 * settings.volume;
      this.envelope = new Envelope(settings.envelope);
      if(settings.filterEnvelope) {
        this.filterEnvelope = new Envelope(settings.filterEnvelope);
      }
      this.oscillatorSettings = [
        new OscillatorSettings(settings.oscillator1),
        new OscillatorSettings(settings.oscillator2),
        new OscillatorSettings(settings.oscillator3)
      ];
      this.vibratoFrequency = settings.vibratoFrequency;

      this.portamentoTime = settings.portamentoTime;
      this.currentPortamentoNote = 45;

      this.filter = this.audioContext.createBiquadFilter();
      this.filter.type = settings.filterType;
      this.filter.frequency.value = settings.filterFrequency || 0;
      this.filter.connect(this.outputNode);

      if(settings.delay) {
        this.delay = this.audioContext.createDelay();
        this.delay.delayTime.value = settings.delay.time;
        this.delayGain = this.audioContext.createGain();
        this.delayGain.gain.value = settings.delay.feedback;
        this.filter.connect(this.delay);
        this.delay.connect(this.delayGain);
        this.delayGain.connect(this.delay);
        this.delayGain.connect(this.outputNode);
      }

      this.domElement = document.createElement('div');
      this.domElement.classList.add('osiris-container');
      this.domElement.classList.add('channel-container');
      this.domElement.innerHTML = `
      <div class="name">
        Osiris Soft Synth <span class="patch-name">${settings.name}</span>
      </div>
      <div class="filter-frequency">
        Filter frequency
        <input
          type="range"
          min="0"
          max="21000"
          step="1"
          >
      </div>
      <div class="active-notes">
      </div>
      `;
      this.UI = {
        activeNotes:
          this.domElement.querySelector('.active-notes'),
        filterFrequencyInput:
          this.domElement.querySelector('.filter-frequency input')     
      };
    }

    tick(time) {
      for(var i = 0; i < this.activeNotesCount; i++) {
        var note = this.notes[i];
        var noteTime = time - note.startTime;
        var releaseTime = time - note.releaseTime;
        if(note.releaseTime == -1) {
          releaseTime = -1;
        }

        if(this.portamentoTime) {
          this.currentPortamentoNote = lerp(
            note.portamentoStart,
            note.portamentoTarget,
            1000 * noteTime / this.portamentoTime);
          for(var j = 0; j < note.oscillators.length; j++) {
          var frequency = this.noteNumberToFrequency(
            this.oscillatorSettings[j].pitch + this.currentPortamentoNote);
          note.oscillators[j].frequency.value = frequency;
          }
        }

        if(this.filterEnvelope) {
          var frequency = 21000 * this.filterEnvelope.getValue(noteTime, releaseTime);
          note.filter.frequency.value = frequency;
        }

        if(releaseTime >= this.envelope.release / 1000) {
          this.notes[i--] = this.notes[--this.activeNotesCount];
          this.notes[this.activeNotesCount] = note;
          note.gain.disconnect(this.filter);
          continue;
        }
        var volume = this.envelope.getValue(noteTime, releaseTime);
        note.gain.gain.value = volume;
        note.gain.gain.value *= note.velocity / 127;
      }
    }
    
    noteNumberToFrequency(note) {
      return 440 * Math.pow(2, (note - 60) / 12);
    }

    noteOn(note, velocity) {
      var time = this.audioContext.currentTime;
      var oscillators = [];
      var gain = this.audioContext.createGain();
      gain.gain.value = 0;
      gain.connect(this.filter);
      if(this.filterEnvelope)  {
        var filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 20000;
      } else {
        var filter = this.audioContext.createGain();
      }
      filter.connect(gain);

      for(var settings of this.oscillatorSettings) {
        var oscillator = this.audioContext.createOscillator();
        oscillator.frequency.value = this.noteNumberToFrequency(
            note + settings.pitch);
        oscillator.type = settings.type;
        oscillator.connect(filter);
        oscillator.start(time);
        var vibratoOscillator = this.audioContext.createOscillator();
        var vibratoGain = this.audioContext.createGain();
        vibratoGain.gain.value = 2;
        vibratoOscillator.frequency.value = this.vibratoFrequency;
        vibratoOscillator.start(time);
        vibratoOscillator.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        oscillators.push(oscillator);
      }
      var n = this.notes[this.activeNotesCount++];
      n.note = note;
      n.startTime = time;
      n.releaseTime = -1;
      n.oscillators = oscillators;
      n.gain = gain;
      n.filter = filter;
      n.velocity = velocity;
      n.portamentoStart = this.currentPortamentoNote;
      n.portamentoTarget = note;
    }

    noteOff(note, velocity) {
      var time = this.audioContext.currentTime;
      for(var i = 0; i < this.activeNotesCount; i++) {
        if(this.notes[i].note == note) {
          if(this.notes[i].releaseTime == -1) {
            for(var oscillator of this.notes[i].oscillators) {
              oscillator.stop(time + (this.envelope.release / 1000));
            }
            this.notes[i].releaseTime = time;
          }
        }
      }
    }

    mod(id, value) {
      switch(id) {
        case 0:
          this.filter.frequency.value = Math.pow(value / 127, 2) * 21000;
          break;
      }
    }

    updateUI() {
      this.UI.activeNotes.innerText = this.activeNotesCount;
      this.UI.filterFrequencyInput.value = this.filter.frequency.value;
    }

  }

  global.Osiris = Osiris;
})(this);
