(function() {

    /**
     * How often we should beep
     */
    var beepInterval;

    const context = new AudioContext();

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
        toggleButton: document.getElementById("toggle-button")
    };

    /**
     * timesThrough: The amount of beeps made. This is counted so
     *               we can find out the first beat of the bar.
     * playSound: Whether or not we should be beeping
     */
    const settings = {
        timesThrough: 0,
        playSound: false
    };

    elements.toggleButton.addEventListener('click', togglePlay);
    elements.tempo.addEventListener('input', updateTempoValue);

    function updateTempoValue() {
        elements.tempoValue.innerText = elements.tempo.value + 'bpm';
    }

    function togglePlay() {
        settings.playSound = !settings.playSound;

        if (settings.playSound) {
            return updateBeepInterval(elements.tempo.value, elements.beatType.value);
        }

        settings.timesThrough = 0;
        clearInterval(beepInterval);
    }

    function updateBeepInterval(tempo, beatType) {
        const interval = parseInt(bpmToMs(tempo, beatType));
        beepInterval = setInterval(tick, interval);
    }

    function bpmToMs(beatsPerMinute, beatType) {

        const noteDurations = {
            2: beatsPerMinute / 2,
            4: beatsPerMinute,
            8: beatsPerMinute * 2,
            16: beatsPerMinute * 4,
            32: beatsPerMinute * 8
        };

        const milliseconds = (60000 / noteDurations[beatType]);

        return milliseconds;
    }

    function tick() {
        settings.timesThrough++;

        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequencies.low;
        oscillator.connect(gain);

        gain.connect(context.destination);

        if (settings.timesThrough % elements.noteType.value === 0) {
            oscillator.frequency.value = frequencies.high
        }

        oscillator.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + .5)
    }
})();
