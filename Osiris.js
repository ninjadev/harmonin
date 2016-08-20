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

  class OsirisUI extends BaseUI {
    constructor(channel) {
      super(channel);
      this.domElement = document.createElement('div');
      this.domElement.classList.add('osiris-container');
      this.domElement.classList.add('channel-container');
      this.domElement.innerHTML = `
      <div class="name">
        Osiris Soft Synth <span class="patch-name">${channel.settings.name}</span>
      </div>
      <div class="filter-frequency">
        Filter frequency
      </div>
      <div class="active-notes">
      </div>
      `;
      this.UI = {
        activeNotes:
          this.domElement.querySelector('.active-notes'),
        filterFrequencyKnob: new Knob()
      };
      this.domElement.querySelector('.filter-frequency').appendChild(
        this.UI.filterFrequencyKnob.domElement);
      this.UI.filterFrequencyKnob.setValue(this.channel.filter.frequency.value / 21000);
      var that = this;
      this.UI.filterFrequencyKnob.callback = function() {
        that.channel.filter.frequency.value = this.value * 21000;
      };
    }

    update() {
      this.UI.activeNotes.innerText = this.channel.activeNotesCount;
    }
  }

  class Osiris extends BaseChannel {
    constructor(audioContext, settings) {
      super(audioContext, settings);
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
          this.__UI.UI.filterFrequencyKnob.setValue(this.filter.frequency.value / 21000);
          break;
      }
    }

  }

  global.Osiris = Osiris;
  global.OsirisUI = OsirisUI;
})(this);
