'use strict';

var BaseChannel = require('./BaseChannel');
var Envelope = require('./Envelope');
var Parameter = require('../utils/Parameter');

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
      this.type = new Parameter(settings.type);
      this.pitch = new Parameter(settings.pitch);
      this.volume = new Parameter(settings.volume);
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
        gain: audioContext.createGain(),
        filter: audioContext.createBiquadFilter(),
        note: 0,
        velocity: 0
      });
      this.notes[i].filter.connect(this.notes[i].gain);
    }
    this.activeNotesCount = 0;
    this.loadPreset(settings);
  }

  loadPreset(settings) {
    super.loadPreset(settings);
    this.envelope = new Envelope(settings.details.envelope);
    this.filterEnvelope = new Envelope(settings.details.filterEnvelope);
    this.oscillatorSettings = [
      new OscillatorSettings(settings.details.oscillator1),
      new OscillatorSettings(settings.details.oscillator2),
      new OscillatorSettings(settings.details.oscillator3)
    ];
    this.vibratoFrequency = new Parameter(settings.details.vibratoFrequency);
    this.vibratoAmount = new Parameter(settings.details.vibratoAmount);

    this.portamentoTime = new Parameter(settings.details.portamentoTime);
    this.currentPortamentoNote = 45;

    this.pitchBend = new Parameter(0);
    this.pitchBendAmount = 2;
    this.noteFilterType = new Parameter(settings.details.noteFilterType || "lowpass");
    console.log(settings.details.noteFilterType, settings);
  }

  tick(time) {
    for(var i = 0; i < this.activeNotesCount; i++) {
      var note = this.notes[i];
      var noteTime = time - note.startTime;
      var releaseTime = time - note.releaseTime;
      if(note.releaseTime == -1) {
        releaseTime = -1;
      }

      if(this.portamentoTime.value) {
        this.currentPortamentoNote = lerp(
          note.portamentoStart,
          note.portamentoTarget,
          1000 * noteTime / this.portamentoTime.value);
        for(var j = 0; j < note.oscillators.length; j++) {
        var frequency = this.noteNumberToFrequency(
          this.oscillatorSettings[j].pitch.value + this.currentPortamentoNote);
        note.oscillators[j].frequency.value = frequency;
        }
      }

      var frequency = 21000 * Math.pow(this.filterEnvelope.getValue(noteTime, releaseTime), 2);
      note.filter.frequency.value = frequency;

      if(releaseTime >= this.envelope.release.value / 1000) {
        this.notes[i--] = this.notes[--this.activeNotesCount];
        this.notes[this.activeNotesCount] = note;
        note.gain.disconnect(this.accumulator);
        continue;
      }
      var volume = this.envelope.getValue(noteTime, releaseTime);
      note.gain.gain.value = volume;
      note.gain.gain.value *= Math.pow(note.velocity / 127, 2);
    }
  }
  
  noteOn(note, velocity) {
    var time = this.audioContext.currentTime;

    var n = this.notes[this.activeNotesCount++];
    n.note = note;
    n.startTime = time;
    n.releaseTime = -1;
    n.oscillators = [];
    n.velocity = velocity;
    n.portamentoStart = this.currentPortamentoNote;
    n.portamentoTarget = note;
    n.gain.gain.value = 0;

    n.filter.type = this.noteFilterType.value;
    n.filter.frequency.value = 20000;

    for(var settings of this.oscillatorSettings) {
      var oscillator = this.audioContext.createOscillator();
      oscillator.frequency.value = this.noteNumberToFrequency(
          note + settings.pitch.value);
      var oscillatorGain = this.audioContext.createGain();
      oscillatorGain.gain.value = settings.volume.value;
      oscillator.type = settings.type.value;
      oscillator.connect(oscillatorGain);
      oscillatorGain.connect(n.filter);
      oscillator.start(time);
      var vibratoOscillator = this.audioContext.createOscillator();
      var vibratoGain = this.audioContext.createGain();
      vibratoGain.gain.value = this.vibratoAmount.value;
      vibratoOscillator.frequency.value = this.vibratoFrequency.value;
      vibratoOscillator.start(time);
      vibratoOscillator.connect(vibratoGain);
      vibratoGain.connect(oscillator.frequency);
      n.oscillators.push(oscillator);
    }

    n.gain.connect(this.accumulator);
  }

  noteOff(note, velocity) {
    var time = this.audioContext.currentTime;
    for(var i = 0; i < this.activeNotesCount; i++) {
      if(this.notes[i].note == note) {
        if(this.notes[i].releaseTime == -1) {
          for(var oscillator of this.notes[i].oscillators) {
            oscillator.stop(time + (this.envelope.release.value / 1000));
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

}

module.exports = Osiris;
