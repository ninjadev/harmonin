const React = require('react');
const Knob = require('./Knob.jsx');
const OsirisUI = require('./OsirisUI');
const SamplerUI = require('./SamplerUI');
const WaveformVisualizer = require('./WaveformVisualizer');


const presets = [
  require('../presets/osiris/ClubStonk'),
  require('../presets/osiris/Mellosynth'),
  require('../presets/osiris/MotionBass'),
  require('../presets/osiris/MotionBell'),
  require('../presets/osiris/MotionChords'),
  require('../presets/osiris/MotionLead'),
  require('../presets/osiris/SquarePluck'),
  require('../presets/osiris/UltraNiceAnalogueStyleSaw'),
  require('../presets/osiris/WidePad')
];

class ChannelUI extends React.Component {

  constructor() {
    super();
    this.state = {
      titleA: '',
      titleB: ''
    };
  }

  loadPreset(preset) {
    this.props.channel.loadPreset(preset);
    this.updateTitle();
    this.forceUpdate();
  }

  loadPresetClicked(event) {
    this.loadPreset(presets[Math.random() * presets.length | 0]);
  }

  componentDidMount() {
    this.updateTitle();
  }

  updateTitle() {
    const titleB = this.props.channel.constructor.name == 'Sampler'
                 ? this.props.channel.settings.filename
                 : this.props.channel.settings.name;
    this.setState({
      titleA: this.props.channel.constructor.name,
      titleB: titleB
    });
  }

  render() {
    return (
      <div className="channel-container">
        <div
          className="load-preset-button"
          onClick={e => this.loadPresetClicked(e)}
          >
          Load preset
        </div>
        <div className="name">
          {this.state.titleA}
          <span className="patch-name">{this.state.titleB}</span>
        </div>
        <div className="base-panel">
          <div className="visualizer">
            <WaveformVisualizer
              width="20"
              height="50"
              audioNode={this.props.channel.outputNode}
              />
          </div>
          <Knob
            name="Volume"
            audioParam={this.props.channel.outputNode.gain}
            mapping="linear"
            min={0}
            max={1}
          />
          <Knob
            name="Reverb"
            audioParam={this.props.channel.reverbSendNode.gain}
            mapping="linear"
            min={0}
            max={1}
            />
          <Knob
            name="Filter frq."
            audioParam={this.props.channel.filter.frequency}
            mapping="square"
            min={0}
            max={21000}
            />
          <Knob
            name="Delay time"
            audioParam={this.props.channel.delay.delayTime}
            mapping="linear"
            min={0}
            max={1}
            />
          <Knob
            name="Delay amount"
            audioParam={this.props.channel.delayGain.gain}
            mapping="linear"
            min={0}
            max={1}
            />
          </div>

          {this.props.channel.constructor.name == 'Osiris' ? 
            <OsirisUI channel={this.props.channel} />
          :''}

          {this.props.channel.constructor.name == 'Sampler' ?
            <SamplerUI channel={this.props.channel} />
          :''}
        </div>
    );
  }
}

module.exports = ChannelUI;
