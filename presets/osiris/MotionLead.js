module.exports = {
  reverb: 0.1,
  name: 'Motion Lead',
  vibratoFrequency: 5,
  vibratoAmount: 4,
  volume: 4,
  portamentoTime: 20,
  filterType: 'highpass',
  filterFrequency: 100,
  waveshaper: {
    curve: (function makeDistortionCurve() {
      var k = 400;
      var n = 48000;
      var curve = new Float32Array(n);
      var deg = Math.PI / 180;
      for (var i = 0; i < n; i++) {
        var x = i * 2 / n - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
      }
      return curve;
    })(),
  },
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
    type: 'square',
    pitch: 12,
    volume: 0.4
  },
  oscillator2: {
    type: 'sawtooth',
    pitch: 0,
    volume: 0.6
  },
  oscillator3: {
    type: 'sawtooth',
    pitch: 24,
    volume: 0
  }
}
