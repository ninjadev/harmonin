var Osiris = require('./channels/Osiris');
var Sampler = require('./channels/Sampler')
const ChannelUI = require('./ui/ChannelUI');
const React = require('react');
const ReactDOM = require('react-dom');
const WaveformVisualizer = require('./ui/WaveformVisualizer');
const MidiKeyboard = require('./ui/MidiKeyboard');

import {Tabs} from 'react-tabs';
Tabs.setUseDefaultStyles(false);


/*
var oReq = new XMLHttpRequest();
oReq.open("GET", "/harmonin2.mid");
oReq.responseType = "arraybuffer";
oReq.onload = function (oEvent) {
  var arrayBuffer = oReq.response;
  if (arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    midiFile = new Midi(byteArray);
    midiFile.add_callback(e => {
      onMidiEvent(e.midi_channel, e.type, e.note_number, e.velocity);
    });
  }
};

oReq.send(null);
*/
class Harmonin extends React.Component {

  constructor() {
    super();
    this.state = {
      masterVisualizerHeight: 0
    };

    this.midiKeyboard = new MidiKeyboard((channel, type, note, velocity) => this.onMidiEvent(channel, type, note, velocity));
    this.midiKeyboard.attach();

    this.channelUIs = {};

    var audioContext = new AudioContext();

    this.channels = [
      new Osiris(audioContext, require('./presets/osiris/UltraNiceAnalogueStyleSaw')),
      new Osiris(audioContext, require('./presets/osiris/Mellosynth')),
      new Osiris(audioContext, require('./presets/osiris/WidePad')),
      new Osiris(audioContext, require('./presets/osiris/SquarePluck')),
      new Sampler(audioContext, {
        volume: 0.5,
        filename: 'data/kick.wav'
      }),
      new Sampler(audioContext, {
        volume: 0.5,
        filename: 'data/snare.wav'
      }),
      new Sampler(audioContext, {
        reverb: 0.25,
        volume: 0.5,
        filename: 'data/hihat.wav'
      }),
      new Sampler(audioContext, {
        reverb: .5,
        volume: 0.5,
        filename: 'data/crash.wav'
      })
    ]

    this.masterOutputNode = audioContext.createGain();
    this.masterOutputNode.connect(audioContext.destination);

    this.reverbNode = audioContext.createConvolver();
    this.reverbNode.connect(this.masterOutputNode);
    const that = this;
    (function() {
      var request = new XMLHttpRequest();
      request.open('GET', 'data/irHall.ogg', true);
      request.responseType = 'arraybuffer';
      request.onload = function() {
        audioContext.decodeAudioData(request.response, function(buffer) {
          that.reverbNode.buffer = buffer;
        },
        function(e){console.log(e)});
      }
      request.send();
    })();

    var eventTimingLoopNode = audioContext.createScriptProcessor(256, 1, 1);
    eventTimingLoopNode.connect(audioContext.destination);
    var time = audioContext.currentTime;
    var oldTime = time;
    var deltaTime = 0;
    eventTimingLoopNode.onaudioprocess = () => {
      time = audioContext.currentTime;
      deltaTime += time - oldTime;
      oldTime = time;
      var step = 256 / audioContext.sampleRate;
      while(deltaTime >= step) {
        deltaTime -= step;
        tick(time, step);
      }
    };

    var midiFile;

    function tick(time, stepSize) {
      if(midiFile) {
        midiFile.play_forward(stepSize * 1000);
      }
      for(var channel of that.channels) {
        channel.tick(time);
      }
    }

    navigator.requestMIDIAccess({}).then(midiAccess => {
      var midi = midiAccess;

      for(var input of midi.inputs.values()) {
        input.addEventListener('midimessage', e => {
          var channel = e.data[0] & 0xf;
          var type = (e.data[0] & 0xf0) >> 4;
          var note = e.data[1];
          var velocity = e.data[2];
          this.onMidiEvent(channel, type, note, velocity);
        });
      }

    }, function(e) {
      console.log(e);  
    });
  }

  onMidiEvent(channel, type, note, velocity) {

    switch(type) {
      case 0x9:
        this.channels[channel].noteOn(note, velocity);
        break;
      case 0x8:
        this.channels[channel].noteOff(note, velocity);
        break;
      case 0xB:
        if(channel in this.channels) {
          this.channels[channel].mod(note, velocity);
        }
        if(this.channelUIs) {
          if(this.channels[channel].id in this.channelUIs) {
            this.channelUIs[this.channels[channel].id].mod(note, velocity);
          }
        }
        break;
    }
  }

  resize() {
    this.setState({
      masterVisualizerHeight: window.innerHeight - 30
    });
  }

  componentDidMount() {
    window.addEventListener('resize',  e => { this.resize(); });
    this.resize();
  }

  solo(id) {
    let didChange = false;
    for(let channelId in this.channelUIs) {
      if(id == channelId) {
        if(this.channelUIs[channelId].state.isMuted) {
          didChange = true;
        }
        this.channelUIs[channelId].unmute();
      } else {
        if(!this.channelUIs[channelId].state.isMuted) {
          didChange = true;
        }
        this.channelUIs[channelId].mute();
      }
    }
    if(!didChange) {
      for(let channelId in this.channelUIs) {
        this.channelUIs[channelId].unmute();
      }
    }
  }

  render() {
    return (
      <div>
       {this.channels.map(channel =>
          <ChannelUI
            channel={channel}
            harmonin={this}            
            key={channel.id}
            ref={channelUI => this.channelUIs[channel.id] = channelUI}
            />)};
        <div
          className="master-visualizer visualizer"
          ref={ref => this.masterVisualizerWrapper = ref}
          >
          <WaveformVisualizer
            audioNode={this.masterOutputNode}
            width={100}
            height={this.state.masterVisualizerHeight}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Harmonin />, document.querySelector('#container'));
