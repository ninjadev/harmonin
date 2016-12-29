
/* One track of a midi file */
function Track(track_data, midi){
    this.midi = midi;
    this.data = track_data;
    this.events = [];
    this.tracker = 0;
    this.active = true;
    this.player_tracker = 0;
    this.dt = 0;
        
    var running_status;
    while(this.tracker<track_data.length){
        var event = {};
        event.dt = this.read_vlf();
        var status = this.read_byte();
        event.type = (status&0xF0)>>4;
        if(event.type < 0x8){
            /* running status, same as type last event */
            status = running_status;
            event.type = (status&0xF0)>>4;
            this.tracker--;
        }
        switch(event.type){

            /* note off */
            case 0x8:
                event.midi_channel = status&0xF;
                event.note_number = this.read_byte();
                event.velocity = this.read_byte();
                break;

            /* note on */
            case 0x9:
                event.midi_channel = status&0xF;
                event.note_number = this.read_byte();
                event.velocity = this.read_byte();

                if(event.velocity == 0){
                    /* event considered by convention to be note off becuase of the running status hack */
                    event.type = 0x8;
                }
                break;

            /* pitch bend */
            case 0xE:
                event.midi_channel = status&0xF;
                var value = this.read_byte()&0x7F;
                value |= (this.read_byte()&0x7F) << 7;
                event.value = value;
                break;

            /* note aftertouch */
            case 0xA:
                /* not supported yet, discard the data */
                this.read_word();
                break;

            /* controller */
            case 0xB:
                /* not supported yet, discard the data */
                this.read_word();
                break;

            /* program change */
            case 0xC:
                /* not supported yet, discard the data */
                this.read_byte();
                break;

            /* channel aftertouch */
            case 0xD:
                /* not supported yet, discard the data */
                this.read_byte();
                break;

            /* meta or system exclusive event */
            case 0xF:
                event.meta_type = this.read_byte();
                var length = this.read_vlf();

                switch(event.meta_type){

                    /* set tempo */
                    case 0x51:
                        var microseconds_per_quaver = this.read_byte();
                        microseconds_per_quaver = (microseconds_per_quaver<<8) | this.read_byte();
                        microseconds_per_quaver = (microseconds_per_quaver<<8) | this.read_byte();
                        event.microseconds_per_quaver = microseconds_per_quaver;
                        break;

                    /* discard data from unsupported meta events */
                    default:
                        while(length-->0){
                            this.read_byte();
                        }
                        break;
                }
                break;

            /* should never reack this far */
            default:
                break;

        }

        running_status = event.status;
        this.events.push(event);
    }

    /* add time until corresponding note off for note on events, and
     * time until next note on event for note off events */
    for(var i=0;i<this.events.length;i++){
        var ei = this.events[i];
        if(ei.type == 0x9 || ei.type == 0x8){
            var hash = ei.note_number+","+ei.midi_channel;
            var time = 0;
            for(var j=i+1;j<this.events.length;j++){
                var ej = this.events[j];
                time += ej.dt;
                if(hash == ej.note_number+","+ei.midi_channel){
                    break;
                }
            }
            ei.time_to_next_sameevent = time;
        }
    }

    /* delete variables becuase they are ugly and are no longer needed */
    delete this.data;
    delete this.tracker;
}


/* A midi file */
function Midi(file){
    this.data = file;
    var size = file.length; 
    this.tracker = 10; //skip to number of tracks in header
    this.tracks = [];
    this.callbacks = [];
    this.tracks.length = this.read_word(); 
    this.time_division = this.read_word();

    /* if the most significant bit is set */
    if(this.time_division&0x8000){

        /* time division is in frames per second */
        this.ticks_per_second = (this.time_division&0x7FFF) * (this.time_division&0x00FF);
    }else{

        /* time division is in ticke per beat */
        this.ticks_per_beat = this.time_division&0x7FFF;

        /* we assume a default of 120BPM to begin with */
        this.ticks_per_second = 2*this.ticks_per_beat;
    }

    for(var i=0;i<this.tracks.length;i++){

        /* discard 4 bytes */
        this.read_dword();

        /* get the length of the track */
        var track_length = this.read_dword();

        /* parse the track */
        this.tracks[i] = new Track(this.data.slice(this.tracker, this.tracker+track_length), this);    

        /* advance the tracker to the next track */
        this.tracker += track_length;
    }

    /* hide some variables becuase they are ugly */
    delete this.data;
    delete this.tracker;

    /* add a hook for tempo setting */
    var that = this;
    this.add_callback(function(event){
        if(event.type == 0xF && event.meta_type == 0x51){
            that.set_microseconds_per_quaver(event.microseconds_per_quaver);
        }
    });
}

Midi.prototype.read_byte = read_byte;
Midi.prototype.read_word = read_word;
Midi.prototype.read_dword = read_dword;
Midi.prototype.read_vlf = read_vlf;

Midi.prototype.set_microseconds_per_quaver = function(microseconds_per_quaver){
    this.ticks_per_second = this.ticks_per_beat / (microseconds_per_quaver/1000000);
};

Midi.prototype.add_callback = function(callback){
    this.callbacks.push(callback);
};

Midi.prototype.remove_callback = function(callback){
    for(var i in this.callbacks){
       if(callback[i] == callback){
            this.callbacks.remove(i);
            break;
       }
    }
};

Midi.prototype.play_forward = function(t){
    t *= this.ticks_per_second * 0.001;
    for(var i=0;i<this.tracks.length;i++){
        this.tracks[i].play_forward(t);
    }
};

Track.prototype.play_forward = function(t){
    if(!this.active) return;
    this.dt -= t;
    while(this.dt<=0){
        this.midi.fire_event(this.events[this.player_tracker]);
        this.player_tracker++;
        if(this.player_tracker < this.events.length){
            this.dt += this.events[this.player_tracker].dt;
        }else{
            this.active = false;
            break;
        }
    }
};

Midi.prototype.fire_event = function(event){
    for(var i=0;i<this.callbacks.length;i++){
        this.callbacks[i](event);
    }
};

Track.prototype.read_byte = read_byte;
Track.prototype.read_word = read_word;
Track.prototype.read_dword = read_dword;
Track.prototype.read_vlf = read_vlf;

function read_byte(){
    return this.data[this.tracker++];    
}

function read_word(){
    var word = this.read_byte();
    word <<= 8; word |= this.read_byte();
    return word;
}

function read_dword(){
    var dword = this.read_byte();
    dword <<= 8; dword |= this.read_byte();
    dword <<= 8; dword |= this.read_byte();
    dword <<= 8; dword |= this.read_byte();
    return dword;
}

function read_vlf(){
    var vlf = 0;
    var next = this.read_byte();
    while(next&0x80){
        next &= 0x7F;
        vlf <<= 7; vlf |= next;
        next = this.read_byte();
    }
    return (vlf<<7) | next;
}


// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
