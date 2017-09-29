(function() {

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
        options: document.getElementById("options"),
        volume: document.getElementById("volume")
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
    elements.toggleOptions.addEventListener('click', function() {
        elements.options.classList.toggle('hidden');
    });

    elements.tempo.addEventListener('input', update);

    function updateTempoValue() {
        elements.tempoValue.innerText = `at ${elements.tempo.value} bpm`;
    }

    function togglePlay() {
        settings.playSound = !settings.playSound;

        let buttonText = "play";

        if (settings.playSound) {
            buttonText = "pause";
        }

        elements.toggleButton.innerText = buttonText;

        update();
    }

    function updateBeatCounter() {
        const val  = elements.noteType.value;
        elements.beatCounter.innerText = `${(settings.timesThrough % val) + 1}`;
    }

    function update() {
        updateTempoValue();
        updateBeatCounter();
        clearInterval(beepInterval);

        if (settings.playSound) {
            return updateBeepInterval(elements.tempo.value, elements.beatType.value);
        }

        settings.timesThrough = 0;
    }

    function updateBeepInterval(tempo, beatType) {
        
        if (tempo > 0) {
            const interval = parseInt(bpmToMs(tempo, beatType));
            beepInterval = setInterval(tick, interval);
        }
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
        updateBeatCounter();

        const oscillator = context.createOscillator();
        const gain = context.createGain();

        gain.gain.value = elements.volume.value;
        oscillator.type = "sine";
        oscillator.frequency.value = frequencies.low;
        oscillator.connect(gain);

        gain.connect(context.destination);

        if (settings.timesThrough % elements.noteType.value === 0) {
            oscillator.frequency.value = frequencies.high
        }

        oscillator.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + .10)
    }
})();
