var Knob = require('./Knob.jsx');
var EnvelopeUI = require('./EnvelopeUI');
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
const React = require('react');
const Piano = require('./Piano');


class OscillatorUI extends React.Component {

  constructor() {
    super();
    if(!OscillatorUI.IMAGE_CACHE) {
      OscillatorUI.IMAGE_CACHE = {};
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 80;
      canvas.height = 60;
      ctx.lineWidth = 5;

      ctx.fillStyle = '#5c6b73';
      ctx.strokeStyle = '#253237';

      ctx.fillRect(0, 0, 80, 60);
      ctx.beginPath();
      ctx.moveTo(15, 30);
      for(let x = 0; x < 50; x++) {
        ctx.lineTo(15 + x, 15 + (Math.sin(x / 50 * Math.PI * 2) + 1) * 0.5 * 30);
      }
      ctx.stroke();
      OscillatorUI.IMAGE_CACHE.sine = canvas.toDataURL();
      ctx.fillStyle = '#253237';
      ctx.strokeStyle = '#5c6b73';
      ctx.fillRect(0, 0, 80, 60);
      ctx.stroke();
      OscillatorUI.IMAGE_CACHE.sineDark = canvas.toDataURL();

      ctx.fillStyle = '#5c6b73';
      ctx.strokeStyle = '#253237';
      ctx.fillRect(0, 0, 80, 60);
      ctx.beginPath();
      let period = 50 / 4 * 2;
      for(let x = 0; x < 50; x++) {
        ctx.lineTo(15 + x, 60 - (15 + ((x + period/4 * 3) % period)));
      }
      ctx.stroke();
      OscillatorUI.IMAGE_CACHE.sawtooth = canvas.toDataURL();
      ctx.fillStyle = '#253237';
      ctx.strokeStyle = '#5c6b73';
      ctx.fillRect(0, 0, 80, 60);
      ctx.stroke();
      OscillatorUI.IMAGE_CACHE.sawtoothDark = canvas.toDataURL();

      ctx.fillStyle = '#5c6b73';
      ctx.strokeStyle = '#253237';
      ctx.fillRect(0, 0, 80, 60);
      ctx.beginPath();
      period = 50 / 4 * 2;
      for(let x = 0; x < 50; x++) {
        ctx.lineTo(15 + x, 60 - (15 + 30 * ( x > 25)));
      }
      ctx.stroke();
      OscillatorUI.IMAGE_CACHE.square = canvas.toDataURL();
      ctx.fillStyle = '#253237';
      ctx.strokeStyle = '#5c6b73';
      ctx.fillRect(0, 0, 80, 60);
      ctx.stroke();
      OscillatorUI.IMAGE_CACHE.squareDark = canvas.toDataURL();

      ctx.fillStyle = '#5c6b73';
      ctx.strokeStyle = '#253237';
      ctx.fillRect(0, 0, 80, 60);
      ctx.beginPath();
      period = 50 / 4 * 3;
      for(let x = 0; x < 50; x++) {
        ctx.lineTo(15 + x, -15 + 30 / period * 2  * ((x % period) > (period / 2) ? (x % period) : period - (x % period)));
      }
      ctx.stroke();
      OscillatorUI.IMAGE_CACHE.triangle = canvas.toDataURL();
      ctx.fillStyle = '#253237';
      ctx.strokeStyle = '#5c6b73';
      ctx.fillRect(0, 0, 80, 60);
      ctx.stroke();
      OscillatorUI.IMAGE_CACHE.triangleDark = canvas.toDataURL();
    }
  }

  onWaveformChange(type) {
    this.props.settings.type.value = type;
    this.forceUpdate();
  }

  render() {
    return (
      <div className="base-panel">
        <div className="oscillator-name">
          {this.props.name}
        </div>
        <div className="oscillator-settings-container">

        {['sine', 'square', 'sawtooth', 'triangle'].map((type, index) => {
          return (
            <div
              key={index}
              style={{
                background: 'url() no-repeat center center',
                backgroundImage: 'url(' + OscillatorUI.IMAGE_CACHE[this.props.settings.type.value == type ? type + 'Dark' : type] + ')',
                backgroundSize: 'cover'
              }}
              className={'waveform-selector-button ' +
                         type + ' ' +
                         (this.props.settings.type.value == type ? 'selected' : '')}
              onClick={e => this.onWaveformChange(type)}
              />
          );
        })}

          <div className="knob-group">
            <Knob
              name="Volume"
              audioParam={this.props.settings.volume}
              mapping="linear"
              min={0}
              max={1}
              />
            <Knob
              name="Pitch"
              audioParam={this.props.settings.pitch}
              mapping="linear"
              min={-12}
              max={12}
              />
          </div>
        </div>
      </div>
    );
  }
}

class OsirisUI extends React.Component {

  savePreset() {
    return {
      vibratoFrequency: this.props.channel.vibratoFrequency.value,
      vibratoAmount: this.props.channel.vibratoAmount.value,
      portamentoTime: this.props.channel.portamentoTime.value,
      envelope: {
        delay: this.props.channel.envelope.delay.value,
        attack: this.props.channel.envelope.attack.value,
        hold: this.props.channel.envelope.hold.value,
        decay: this.props.channel.envelope.decay.value,
        sustain: this.props.channel.envelope.sustain.value,
        release: this.props.channel.envelope.release.value,
        amount: this.props.channel.envelope.amount.value,
        offset: this.props.channel.envelope.offset.value
      },
      filterEnvelope: {
        delay: this.props.channel.filterEnvelope.delay.value,
        attack: this.props.channel.filterEnvelope.attack.value,
        hold: this.props.channel.filterEnvelope.hold.value,
        decay: this.props.channel.filterEnvelope.decay.value,
        sustain: this.props.channel.filterEnvelope.sustain.value,
        release: this.props.channel.filterEnvelope.release.value,
        amount: this.props.channel.filterEnvelope.amount.value,
        offset: this.props.channel.filterEnvelope.offset.value
      },
      oscillator1: {
        type: this.props.channel.oscillatorSettings[0].type.value,
        pitch: this.props.channel.oscillatorSettings[0].pitch.value,
        volume: this.props.channel.oscillatorSettings[0].volume.value
      },
      oscillator2: {
        type: this.props.channel.oscillatorSettings[1].type.value,
        pitch: this.props.channel.oscillatorSettings[1].pitch.value,
        volume: this.props.channel.oscillatorSettings[1].volume.value
      },
      oscillator3: {
        type: this.props.channel.oscillatorSettings[2].type.value,
        pitch: this.props.channel.oscillatorSettings[2].pitch.value,
        volume: this.props.channel.oscillatorSettings[2].volume.value
      }
    };
  }


  render() {
    return (
      <div className="base-panel"> 

       <Tabs selectedIndex={4}>

        <TabList>
          <Tab>OSCILLATORS</Tab>
          <Tab>VOLUME ENV.</Tab>
          <Tab>FILTER ENV.</Tab>
          <Tab>MISC.</Tab>
          <Tab>PIANO</Tab>
        </TabList>

        <TabPanel>
          <div className="inverted">
            <OscillatorUI
              name="Oscillator 1"
              settings={this.props.channel.oscillatorSettings[0]}
              />
            <OscillatorUI
              name="Oscillator 2"
              settings={this.props.channel.oscillatorSettings[1]}
              />
            <OscillatorUI
              name="Oscillator 3"
              settings={this.props.channel.oscillatorSettings[2]}
              />
          </div>
        </TabPanel>

        <TabPanel>
          <div className="inverted">
            <EnvelopeUI
              name="Volume envelope"
              envelope={this.props.channel.envelope}
              />
          </div>
        </TabPanel>

        <TabPanel>
          <div className="inverted">
            <EnvelopeUI
              name="Filter envelope"
              envelope={this.props.channel.filterEnvelope}
              />
          </div>
        </TabPanel>

        <TabPanel>
          <div className="inverted">
            <div className="base-panel">
              <div className="knob-group">
                <Knob
                  name="Portamento"
                  audioParam={this.props.channel.portamentoTime}
                  mapping="linear"
                  min={0}
                  max={1000}
                  />
                <Knob
                  name="Vibrato frq."
                  audioParam={this.props.channel.vibratoFrequency}
                  mapping="square"
                  min={0}
                  max={100}
                  />
                <Knob
                  name="Vibrato amount"
                  audioParam={this.props.channel.vibratoAmount}
                  mapping="square"
                  min={0}
                  max={12}
                  />
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="inverted">
            <div className="base-panel">
              <Piano channel={this.props.channel} />
            </div>
          </div>
        </TabPanel>
      </Tabs>
      </div>
    );
  }
}

module.exports = OsirisUI;
