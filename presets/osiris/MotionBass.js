module.exports = {
  reverb: 0,
  name: 'Motion Bass',
  vibratoFrequency: 0,
  volume: 2,
  portamentoTime: 0,
  filterType: 'lowpass',
  filterFrequency: 2000,
  envelope: {
    delay: 0,
    attack: 0,
    hold: 0,
    decay: 0,
    sustain: 1,
    release: 0,
    amount: 1,
    offset: 0
  },
  oscillator1: {
    type: 'triangle',
    pitch: 12,
    volume: 1
  },
  oscillator2: {
    type: 'sawtooth',
    pitch: 0,
    volume: 0.5
  },
  oscillator3: {
    type: 'sawtooth',
    pitch: 24,
    volume: 0
  }
}
