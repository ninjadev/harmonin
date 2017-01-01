var Parameter = require('../utils/Parameter');
var Knob = require('./Knob.jsx');
const React = require('react');


class EnvelopeUI extends React.Component {

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.updateCanvas();
  }

  updateCanvas() {
    if(!this.ctx || !this.canvas) {
      return;
    }
    this.canvas.width = this.canvas.width;
    this.ctx.save();
    this.ctx.strokeStyle = '#9db4c0';
    this.ctx.fillStyle = '#253237';
    this.ctx.lineWidth = 2;
    let x = 0;
    this.ctx.moveTo(0, (1 - this.props.envelope.offset.value) * this.canvas.height);

    x += this.props.envelope.delay.value;
    this.ctx.lineTo(x, (1 - this.props.envelope.offset.value) * this.canvas.height);
    this.ctx.fillRect(x, 0, 1, this.canvas.height);

    x += this.props.envelope.attack.value;
    this.ctx.lineTo(x, (1 - this.props.envelope.amount.value) * this.canvas.height);
    this.ctx.fillRect(x, 0, 1, this.canvas.height);

    x += this.props.envelope.hold.value;
    this.ctx.lineTo(x, (1 - this.props.envelope.amount.value) * this.canvas.height);
    this.ctx.fillRect(x, 0, 1, this.canvas.height);

    x += this.props.envelope.decay.value;
    this.ctx.lineTo(x, (1 - this.props.envelope.sustain.value) * this.canvas.height);
    this.ctx.fillRect(x, 0, 1, this.canvas.height);

    x += this.props.envelope.release.value;
    this.ctx.lineTo(x, this.canvas.height);
    this.ctx.fillRect(x, 0, 1, this.canvas.height);

    this.ctx.stroke();

    this.ctx.lineTo(0, this.canvas.height);
    this.ctx.fillStyle = '#9db4c0';
    this.ctx.globalAlpha = .3;
    this.ctx.fill();
    this.ctx.restore();
  }

  render() {
    return (
      <div className="base-panel">
        <div className="envelope-visualizer">
          <canvas
            ref={ref => this.canvas = ref}
            width="600"
            height="100"
            />
        </div>
        <div className="knob-group">
          <Knob
            name="Delay"
            audioParam={this.props.envelope.delay}
            mapping="linear"
            min={0}
            max={1000}
            onChange={() => this.updateCanvas()}
            />
          <Knob
            name="Attack"
            audioParam={this.props.envelope.attack}
            mapping="linear"
            min={0}
            max={1000}
            onChange={() => this.updateCanvas()}
            />
          <Knob
            name="Hold"
            audioParam={this.props.envelope.hold}
            mapping="linear"
            min={0}
            max={1000}
            onChange={() => this.updateCanvas()}
            />
          <Knob
            name="Decay"
            audioParam={this.props.envelope.decay}
            mapping="linear"
            min={0}
            max={1000}
            onChange={() => this.updateCanvas()}
            />
          <Knob
            name="Sustain"
            audioParam={this.props.envelope.sustain}
            mapping="linear"
            min={0}
            max={1}
            onChange={() => this.updateCanvas()}
            />
          <Knob
            name="Release"
            audioParam={this.props.envelope.release}
            mapping="linear"
            min={0}
            max={1000}
            onChange={() => this.updateCanvas()}
            />
          <Knob
            name="Amount"
            audioParam={this.props.envelope.amount}
            mapping="linear"
            min={0}
            max={1}
            onChange={() => this.updateCanvas()}
            />
          <Knob
            name="Offset"
            audioParam={this.props.envelope.offset}
            mapping="linear"
            min={0}
            max={1}
            onChange={() => this.updateCanvas()}
            />
        </div>
      </div>
    );
  }
}

module.exports = EnvelopeUI;
