var Parameter = require('../utils/Parameter');
var Knob = require('./Knob.jsx');
const React = require('react');


class EnvelopeUI extends React.Component {

  render() {
    return (
      <div className="base-panel">
        <Knob
          name="Delay"
          audioParam={this.props.envelope.delay}
          mapping="linear"
          min={0}
          max={1000}
          />
        <Knob
          name="Attack"
          audioParam={this.props.envelope.attack}
          mapping="linear"
          min={0}
          max={1000}
          />
        <Knob
          name="Hold"
          audioParam={this.props.envelope.hold}
          mapping="linear"
          min={0}
          max={1000}
          />
        <Knob
          name="Decay"
          audioParam={this.props.envelope.decay}
          mapping="linear"
          min={0}
          max={1000}
          />
        <Knob
          name="Sustain"
          audioParam={this.props.envelope.sustain}
          mapping="linear"
          min={0}
          max={1}
          />
        <Knob
          name="Release"
          audioParam={this.props.envelope.release}
          mapping="linear"
          min={0}
          max={1000}
          />
        <Knob
          name="Amount"
          audioParam={this.props.envelope.amount}
          mapping="linear"
          min={0}
          max={1}
          />
        <Knob
          name="Offset"
          audioParam={this.props.envelope.offset}
          mapping="linear"
          min={0}
          max={1}
          />
      </div>
    );
  }
}

module.exports = EnvelopeUI;
