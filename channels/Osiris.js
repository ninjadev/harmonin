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
      this.type = settings.type;
      this.pitch = new Parameter(settings.pitch);
      this.volume = settings.volume;
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
    this.filterEnvelope = new Envelope(settings.filterEnvelope);
    this.oscillatorSettings = [
      new OscillatorSettings(settings.oscillator1),
      new OscillatorSettings(settings.oscillator2),
      new OscillatorSettings(settings.oscillator3)
    ];
    this.vibratoFrequency = new Parameter(settings.vibratoFrequency);
    this.vibratoAmount = new Parameter(settings.vibratoAmount);

    this.portamentoTime = new Parameter(settings.portamentoTime);
    this.currentPortamentoNote = 45;

    this.pitchBend = new Parameter(0);
    this.pitchBendAmount = 2;
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

      if(this.filterEnvelope) {
        var frequency = 21000 * Math.pow(this.filterEnvelope.getValue(noteTime, releaseTime), 2);
        note.filter.frequency.value = frequency;
      }

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
    var oscillators = [];
    var gain = this.audioContext.createGain();
    gain.gain.value = 0;
    gain.connect(this.accumulator);
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
          note + settings.pitch.value);
      var oscillatorGain = this.audioContext.createGain();
      oscillatorGain.gain.value = settings.volume;
      oscillator.type = settings.type;
      oscillator.connect(oscillatorGain);
      oscillatorGain.connect(filter);
      oscillator.start(time);
      var vibratoOscillator = this.audioContext.createOscillator();
      var vibratoGain = this.audioContext.createGain();
      vibratoGain.gain.value = this.vibratoAmount.value;
      vibratoOscillator.frequency.value = this.vibratoFrequency.value;
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
