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

function smoothstep (min, max, value) {
  var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
  return x*x*(3 - 2*x);
};

class ChannelUI extends React.Component {

  constructor() {
    super();
    this.state = {
      titleA: '',
      titleB: ''
    };

    if(!ChannelUI.IMAGE_CACHE) {
      ChannelUI.IMAGE_CACHE = {};
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 80;
      canvas.height = 60;
      ctx.lineWidth = 5;

      ctx.fillStyle = '#5c6b73';
      ctx.strokeStyle = '#253237';

      ctx.fillRect(0, 0, 80, 60);
      ctx.beginPath();
      for(let x = 0; x < 50; x++) {
        let y = 30 * smoothstep(0, 1, (x - 20) / 10);
        ctx.lineTo(15 + x, 15 + y);
      }
      ctx.stroke();
      ChannelUI.IMAGE_CACHE.lowpass = canvas.toDataURL();
      ctx.fillStyle = '#253237';
      ctx.strokeStyle = '#5c6b73';
      ctx.fillRect(0, 0, 80, 60);
      ctx.stroke();
      ChannelUI.IMAGE_CACHE.lowpassDark = canvas.toDataURL();

      ctx.fillStyle = '#5c6b73';
      ctx.strokeStyle = '#253237';
      ctx.fillRect(0, 0, 80, 60);
      ctx.beginPath();
      for(let x = 0; x < 50; x++) {
        let y = 30 * smoothstep(0, 1, (x - 20) / 10);
        ctx.lineTo(15 + x, 60 - 15 - y);
      }
      ctx.stroke();
      ChannelUI.IMAGE_CACHE.highpass = canvas.toDataURL();
      ctx.fillStyle = '#253237';
      ctx.strokeStyle = '#5c6b73';
      ctx.fillRect(0, 0, 80, 60);
      ctx.stroke();
      ChannelUI.IMAGE_CACHE.highpassDark = canvas.toDataURL();

      ctx.fillStyle = '#5c6b73';
      ctx.strokeStyle = '#253237';
      ctx.fillRect(0, 0, 80, 60);
      ctx.beginPath();
      for(let x = 0; x < 50; x++) {
        let y = 30 * smoothstep(0, 1, (x - 20) / 5);
        if(x > 25) {
          y = 30 * smoothstep(1, 0, (x - 30) / 5);
        }
        ctx.lineTo(15 + x, 60 - 15 - y);
      }
      ctx.stroke();
      ChannelUI.IMAGE_CACHE.bandpass = canvas.toDataURL();
      ctx.fillStyle = '#253237';
      ctx.strokeStyle = '#5c6b73';
      ctx.fillRect(0, 0, 80, 60);
      ctx.stroke();
      ChannelUI.IMAGE_CACHE.bandpassDark = canvas.toDataURL();
    }
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

  onFilterTypeChange(type) {
    this.props.channel.filter.type = type;
    this.forceUpdate();
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

          <div style={{float: 'right'}}>
          <Knob
            name="Filter frq."
            audioParam={this.props.channel.filter.frequency}
            mapping="square"
            min={0}
            max={21000}
            />
        {['lowpass', 'highpass', 'bandpass'].map((type, index) => {
          return (
            <div
              key={index}
              style={{
                background: 'url() no-repeat center center',
                backgroundImage: 'url(' + ChannelUI.IMAGE_CACHE[this.props.channel.filter.type == type ? type + 'Dark' : type] + ')',
                backgroundSize: 'cover'
              }}
              className={'filter-selector-button ' +
                         type + ' ' +
                         (this.props.channel.filter.type == type ? 'selected' : '')}
              onClick={e => this.onFilterTypeChange(type)}
              />
          );
        })}
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
