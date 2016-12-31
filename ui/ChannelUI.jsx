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
      titleB: '',
      showPresetList: false,
      isMuted: true
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

  savePresetClicked(e) {
    this.savePreset();
  }

  savePreset() {
    const preset = {
      reverb: this.props.channel.reverbSendNode.gain.value,
      name: this.state.titleB,
      synth: this.props.channel.constructor.name,
      volume: this.props.channel.outputNode.gain.value,
      filterType: this.props.channel.filter.type,
      filterFrequency: this.props.channel.filter.frequency.value,
      delayTime: this.props.channel.delay.delayTime.value,
      delayGain: this.props.channel.delayGain.gain.value,
      details: this.channelUI.savePreset()
    };
    console.log(JSON.stringify(preset));
  }

  loadPreset(preset) {
    this.props.channel.loadPreset(preset);
    this.updateTitle();
    this.forceUpdate();
  }

  loadPresetClicked(event) {
    this.setState({showPresetList: !this.state.showPresetList});
  }

  presetClicked(event) {
    this.loadPreset(presets[+event.target.dataset.preset]);
    this.setState({showPresetList: false});
  }

  componentDidMount() {
    this.updateTitle();
    this.unmute();
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

  mod() {
    if(this.filterFrequencyKnob) {
      this.filterFrequencyKnob.update();
    }
  }

  mute() {
    this.setState({isMuted: true});
    this.props.channel.outputNode.disconnect(this.masterOutputNode);
    this.props.channel.reverbSendNode.disconnect(this.reverbNode);
    this.waveformVisualizer.onDisconnect();
  }

  unmute() {
    this.setState({isMuted: false});
    this.props.channel.outputNode.connect(this.props.harmonin.masterOutputNode);
    this.props.channel.outputNode.connect(this.waveformVisualizer.analyserNode);
    this.props.channel.reverbSendNode.connect(this.props.harmonin.reverbNode);
    this.waveformVisualizer.onConnect();
  }

  toggleMute() {
    if(this.state.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  toggleCollapse() {
    this.setState({isCollapsed: !this.state.isCollapsed});
  }

  soloPressed(e) {
    e.preventDefault();
    this.props.harmonin.solo(this.props.channel.id);
  }

  soloCollapsePressed(e) {
    e.preventDefault();
    this.props.harmonin.soloCollapse(this.props.channel.id);
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

        <div
          className="load-preset-button"
          onClick={e => this.savePresetClicked(e)}
          >
          Save preset
        </div>
        {this.state.showPresetList ?
          <div className="preset-list">
            {presets.map((preset, index) =>
              <div 
                data-preset={index}
                key={index}
                onClick={e => this.presetClicked(e)}
                >
                {preset.name}
             </div>)}
           </div>
        : ''}
        <div className="name">
          {this.state.titleA}
          <span className="patch-name">{this.state.titleB}</span>
        </div>

        <div
          className={'collapse-button ' + (this.state.isCollapsed ? 'collapsed' : '')}
          onClick={e => this.toggleCollapse()}
          onContextMenu={e => this.soloCollapsePressed(e)}
          />

        <div className="base-panel">
          <div className="visualizer">
            <WaveformVisualizer
              width="20"
              height="50"
              audioNode={this.props.channel.outputNode}
              ref={ref => this.waveformVisualizer = ref}
              />
          </div>

          <div style={{float: 'right'}}>
          <Knob
            name="Filter frq."
            audioParam={this.props.channel.filter.frequency}
            mapping="square"
            min={0}
            max={21000}
            ref={filterFrequencyKnob => this.filterFrequencyKnob = filterFrequencyKnob }
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
          <div
            className={'mute-button ' + (this.state.isMuted ? 'muted' : '')}
            onClick={e => this.toggleMute()}
            onContextMenu={e => this.soloPressed(e)}
            />
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


          <div
            className={'details-container ' + (this.state.isCollapsed ? 'collapsed' : '')}
            >
            {this.props.channel.constructor.name == 'Osiris' ? 
              <OsirisUI
                channel={this.props.channel}
                ref={ui => this.channelUI = ui}
                />
            :''}

            {this.props.channel.constructor.name == 'Sampler' ?
              <SamplerUI
                channel={this.props.channel}
                ref={ui => this.channelUI = ui}
                />
            :''}
          </div>
        </div>
    );
  }
}

module.exports = ChannelUI;
