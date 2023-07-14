/**

 observation.js - Copyright 2023 Harshad Joshi and Bufferstack.IO Analytics Technology LLP, Pune

 Licensed under the GNU General Public License, Version 3.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 https://www.gnu.org/licenses/gpl-3.0.html

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 **/

var fft = require('fft-js').fft;
var fftUtil = require('fft-js').util;

module.exports = function(RED) {
    function ObservationNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var samples = []; // Array to hold the incoming values for Fourier analysis
        var outOfControlCount = 0; // Counter for outOfControl flags
        var spikeCount = 0; // Counter for detected spikes

        node.on('input', function(msg) {
            // If msg.payload.query exists and equals "state", return the current state
            if(msg.payload.query && msg.payload.query === "state") {
                msg.payload.state = {
                    outOfControlCount: outOfControlCount,
                    spikeCount: spikeCount
                };
                node.send(msg);
                return; // Return here to avoid further processing
            }

            // If msg.payload.value exists and is a number, add it to the samples array
            if(msg.payload.value && typeof msg.payload.value === "number") {
                samples.push([msg.payload.value, 0]);
            }
            
            // Check the window size
            var sampleWindowSize = Number.isInteger(config.sampleWindowSize) && config.sampleWindowSize > 0 ? config.sampleWindowSize : 16; //64

            // When the window is filled, perform Fourier Transform
            if(samples.length === sampleWindowSize) {
                var phasors = fft(samples);
                var frequencies = fftUtil.fftFreq(phasors, sampleWindowSize); 
                var magnitudes = fftUtil.fftMag(phasors);

                msg.payload.frequencies = frequencies;
                msg.payload.magnitudes = magnitudes;
                
                // Check for spike based on Fourier analysis results
                var spikeThreshold = 0.5; // Set threshold as required
                if(Math.max(...magnitudes) > spikeThreshold) {
                    spikeCount++;
                    msg.payload.spikeDetected = true;
                    node.status({fill:"yellow",shape:"ring",text:"Spike detected"});
                } else {
                    msg.payload.spikeDetected = false;
                    spikeCount = 0; // Reset spike count if no spike detected
                    node.status({fill:"blue",shape:"dot",text:"No spike detected"});
                }

                // Check for alarm condition
                var outOfControlLimit = parseInt(config.outOfControlLimit) || 5; // Use config value if exists, parse as integer
                var spikeLimit = parseInt(config.spikeLimit) || 3; // Use config value if exists, parse as integer
                if(outOfControlCount >= outOfControlLimit || spikeCount >= spikeLimit) {
                    msg.payload.alarm = 'Alarm condition present, check system';
                    node.status({fill:"red",shape:"ring",text:"Alarm: Potential failure"});
                    outOfControlCount = 0; // Reset outOfControl count after alarm
                    spikeCount = 0; // Reset spike count after alarm
                }

                // Reset the samples array after performing the FFT
                samples = [];

                node.send(msg);
            }
            // Check outOfControl flag status
            if(msg.payload.hasOwnProperty('outOfControl')) {
                if(msg.payload.outOfControl) {
                    outOfControlCount++;
                 //   node.status({fill:"orange", shape:"ring", text:"Out of control count: " + outOfControlCount});
                } else {
                    outOfControlCount = 0;
                    node.status({fill:"green", shape:"dot", text:"System is under control."});
                }
            }

            
        });

        // Handle errors
        node.on('error', function(error) {
            node.status({fill:"red", shape:"ring", text: "Error: " + error.message});
        });
    }
    RED.nodes.registerType("observation", ObservationNode);
}

