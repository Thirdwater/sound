const AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();

var mediaConstraint = {
    audio: true,
    video: true
};
var mediaPromise = navigator.mediaDevices.getUserMedia(mediaConstraint);
mediaPromise.then(function(stream) {
    var videoElement = document.getElementById("test-video");
    videoElement.srcObject = stream;
    videoElement.play();

    var microphoneStreamSourceNode = audioContext.createMediaStreamSource(stream);
    microphoneStreamSourceNode.connect(audioContext.destination);

    var timeDomainVisualizerNode = audioContext.createAnalyser();
    microphoneStreamSourceNode.connect(timeDomainVisualizerNode);
    var bufferLength = 32;
    var dataBuffer = new Float32Array(bufferLength);
    var canvasElement = document.getElementById("test-time-domain");
    var canvasContext = canvasElement.getContext('2d');
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

    function draw() {
        drawVisual = requestAnimationFrame(draw);
        timeDomainVisualizerNode.getFloatTimeDomainData(dataBuffer);

        canvasContext.fillStyle = 'rgb(200, 200, 200)';
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);

        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = 'rgb(0, 0, 0)';
        canvasContext.beginPath();
        var sliceWidth = canvasElement.width / bufferLength;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
            var v = dataBuffer[i] * 200.0;
            var y = (canvasElement.height / 2) + v;
            if (i === 0) {
                canvasContext.moveTo(x, y);
            } else {
                canvasContext.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasContext.lineTo(canvasElement.width, canvasElement.height / 2);
        canvasContext.stroke();
        console.log(dataBuffer);
    }
    draw();
});
mediaPromise.catch(function(error) {
    console.error("Failed to capture user microphone.");
});
