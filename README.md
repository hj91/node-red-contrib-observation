# Node-RED Smart Machine Alarm System Node: Observation Node

This module defines a Node-RED node, the `ObservationNode`, developed by Harshad Joshi (GitHub: [hj91](https://github.com/hj91)). This node processes input from the [node-red-contrib-simple-spc](https://flows.nodered.org/node/node-red-contrib-simple-spc) node, checks for certain conditions, and provides output accordingly.

## Installation

Before using this node, ensure that the `fft-js` and `node-red-contrib-simple-spc` modules are installed:

```bash
npm install fft-js
npm install node-red-contrib-simple-spc
```

## Usage

This Node-RED custom node checks for spikes and out-of-control conditions in data from the `node-red-contrib-simple-spc` node. It can trigger an alarm if either condition exceeds a certain limit, which can be configured in the Node-RED flow editor.

## Input and Output

The `ObservationNode` accepts input from the `node-red-contrib-simple-spc` node, checks for certain conditions, and accordingly sends output messages with properties such as frequencies, magnitudes, spikeDetected, alarm, and state.

## Error Handling

The `ObservationNode` provides effective error handling, updating its status with an error message in case of any errors.

## Example

The `ObservationNode`is used in a flow to accept samples from the `node-red-contrib-simple-spc` node, and check for spike and out-of-control conditions.

## License

This project is licensed under the [GPL-3.0 License](https://opensource.org/licenses/GPL-3.0).

