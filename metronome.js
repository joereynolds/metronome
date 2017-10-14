/**
 * How often we should beep
 */
var beepInterval;

const context = new (window.AudioContext || window.webkitAudioContext)();

/**
 * Low: The beep that is made on every beat but the main beat
 * High: The beep that is made on the first beat of the bar
 */
const frequencies = {
    low: 880.0,
    high: 1760.0
};

const elements = {
    noteType: document.getElementById("note-type"),
    beatType: document.getElementById("beat-type"),
    tempo: document.getElementById("tempo"),
    tempoValue: document.getElementById("tempo-value"),
    toggleButton: document.getElementById("toggle-button"),
    beatCounter: document.getElementById("beat-counter"),
    toggleOptions: document.getElementById("toggle-options"),
    closeOptions: document.getElementById("close-options"),
    options: document.getElementById("options"),
    volume: document.getElementById("volume"),
    waveform: document.getElementById("waveform")
};

/**
 * timesThrough: The amount of beeps made. This is counted so
 *               we can find out the first beat of the bar.
 * playSound: Whether or not we should be beeping
 */
const settings = {
    timesThrough: -1,
    playSound: false
};

elements.toggleButton.addEventListener('click', togglePlay);

elements.toggleOptions.addEventListener('click', function () {
    elements.options.classList.toggle('hidden');
});

elements.beatType.addEventListener('input', update);

// tempo: update display value while dragged and update beat when release
elements.tempo.addEventListener('input', updateTempoValue);
elements.tempo.addEventListener('change', update);

elements.closeOptions.addEventListener('click', (e) => {
    elements.options.classList.toggle('hidden');
});

function updateTempoValue() {
    elements.tempoValue.innerText = `at ${elements.tempo.value} bpm`;
}

function togglePlay() {
    settings.playSound = !settings.playSound;
    update(settings.playSound);
}

function updateBeatCounter() {
    const val = elements.noteType.value;
    elements.beatCounter.innerText = `${(settings.timesThrough % val) + 1}`;
}

/**
 * Updates the text of the button.
 * @param {Boolean} shouldPlaySound
 */
function updateToggleButtonText(shouldPlaySound) {
    let buttonText = "start";

    if (shouldPlaySound) {
        buttonText = "stop";
    }

    return buttonText;
}

function update(shouldPlaySound) {
    updateTempoValue();
    updateBeatCounter();
    elements.toggleButton.innerText = updateToggleButtonText(shouldPlaySound);
    clearInterval(beepInterval);

    if (shouldPlaySound) {
        // Tick once before starting the interval, to make the metronome
        // start immediately when pressing play.
        tick();
        return updateBeepInterval(elements.tempo.value, elements.beatType.value);
    }

    settings.timesThrough = -1;
}

function updateBeepInterval(tempo, beatType) {

    if (tempo > 0) {
        const interval = parseInt(bpmToMs(tempo, beatType));
        beepInterval = setInterval(tick, interval);
    }
}

function bpmToMs(beatsPerMinute, beatType) {

    const noteDurations = {
        1: beatsPerMinute / 4,
        2: beatsPerMinute / 2,
        4: beatsPerMinute,
        8: beatsPerMinute * 2,
        16: beatsPerMinute * 4,
        32: beatsPerMinute * 8
    };

    const milliseconds = (60000 / noteDurations[beatType]);

    return milliseconds;
}

function shouldBeep (timesThrough, noteType) {
    return timesThrough % noteType === 0;
}

function tick() {
    settings.timesThrough++;
    updateBeatCounter();

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    gain.gain.value = elements.volume.value;
    oscillator.type = elements.waveform.value;
    oscillator.frequency.value = frequencies.low;
    oscillator.connect(gain);

    gain.connect(context.destination);

    timeToBeep = shouldBeep(settings.timesThrough, elements.noteType.value)

    if (timeToBeep) {
        oscillator.frequency.value = frequencies.high
    }

    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);

    if (gain.gain.value > 0) {
        gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + .10)
    }
}
