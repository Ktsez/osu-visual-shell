export function createAudioGraph(audio) {
  let audioContext;
  let analyser;
  let sourceNode;
  let freqData;

  function setupAudioGraph() {
    if (audioContext) return { audioContext, analyser, sourceNode, freqData };
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.82;
    freqData = new Uint8Array(analyser.frequencyBinCount);
    sourceNode = audioContext.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
    return { audioContext, analyser, sourceNode, freqData };
  }

  function getAudioGraph() {
    return { audioContext, analyser, sourceNode, freqData };
  }

  return { setupAudioGraph, getAudioGraph };
}
