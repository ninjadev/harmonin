var Knob = require('./Knob.jsx');
var EnvelopeUI = require('./EnvelopeUI');
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
const React = require('react');


class OscillatorUI extends React.Component {
  render() {
    return (
      <div className="base-panel">
        <Knob
          name="Pitch"
          audioParam={this.props.settings.pitch}
          mapping="linear"
          min={-12}
          max={12}
          />
      </div>
    );
  }
}

class OsirisUI extends React.Component {

  render() {
    return (
      <div className="base-panel"> 

       <Tabs>

        <TabList>
          <Tab>OSCILLATORS</Tab>
          <Tab>VOLUME ENV.</Tab>
          <Tab>FILTER ENV.</Tab>
          <Tab>MISC.</Tab>
        </TabList>

        <TabPanel>
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
        </TabPanel>

        <TabPanel>
          <EnvelopeUI
            name="Volume envelope"
            envelope={this.props.channel.envelope}
            />
        </TabPanel>

        <TabPanel>
          <EnvelopeUI
            name="Filter envelope"
            envelope={this.props.channel.filterEnvelope}
            />
        </TabPanel>

        <TabPanel>
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
        </TabPanel>
      </Tabs>
      </div>
    );
  }
}

module.exports = OsirisUI;
