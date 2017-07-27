// Copyright (c) 2015-2017 Robert Rypuła - https://audio-network.rypula.pl
'use strict';

var
    DIGIT_ZERO_SYMBOL = 100,

    physicalLayer,
    physicalLayerConfiguration = {
        fftFrequencyBinSkipFactor: 3,
        symbolMin: 93,
        symbolMax: 117,
        symbolSyncA: 108,
        symbolSyncB: 109
    },
    rxSpectrogram,
    rxSymbolList = [],
    txSampleRateWidget;

function init() {
    physicalLayer = new PhysicalLayer(stateHandler, physicalLayerConfiguration);

    rxSpectrogram = new Spectrogram(document.getElementById('rx-spectrogram'));
    txSampleRateWidget = new EditableFloatWidget(
        document.getElementById('tx-sample-rate'),
        physicalLayer.getTxSampleRate(), 5, 0,
        onTxSampleRateWidgetChange
    );
    document.addEventListener(
        'keyup',
        function(e) {
            var digit = getDigitFromKeyCode(e.keyCode);

            if (digit !== null) {
                physicalLayer.txSymbol(DIGIT_ZERO_SYMBOL + digit);
            }
        },
        true
    );

    onLoopbackCheckboxChange();
}

function getDigitFromKeyCode(keyCode) {
    var digit = null;

    // digits from standard keys and numeric keys
    if (keyCode >= 48 && keyCode <= 57) {
        digit = keyCode - 48;
    } else {
        if (keyCode >= 96 && keyCode <= 105) {
            digit = keyCode - 96;
        }
    }

    return digit;
}

function onLoopbackCheckboxChange() {
    physicalLayer.setLoopback(
        document.getElementById('loopback-checkbox').checked
    );
}

function onTxSampleRateWidgetChange() {
    physicalLayer.setTxSampleRate(txSampleRateWidget.getValue());
}

function refreshTxSymbolQueue() {
    var txSymbolQueue = physicalLayer.getTxSymbolQueue();

    html('#tx-symbol-queue', txSymbolQueue.join(', '));
}

function stateHandler(state) {
    if (state.isSymbolReadyToTake) {
        rxSymbolList.push(state.symbol);
    }
    updateView(state);
}

function updateView(state) {
    var cd;

    html(
        '#rx-dsp-detail',
        'Sample rate: ' + (state.dsp.sampleRateReceive / 1000).toFixed(1) + ' kHz<br/>' +
        'FFT size: ' + state.dsp.fftSize + '<br/>' +
        'FFT time: ' + state.dsp.fftWindowTime.toFixed(3) + ' sec<br/>' +
        'Symbol spacing: ' + state.dsp.symbolFrequencySpacing.toFixed(3) + ' Hz'
    );

    if (state.isConnectionInProgress) {
        html('#rx-log-connect', 'connecting...');
    } else {
        if (state.isConnected) {
            cd = state.connectionDetail;
            html(
                '#rx-log-connect',
                'Connected!<br/>' +
                '- offset ' + cd.offset + '<br/>' +
                '- correlation ' + Math.abs(cd.correlationValue) + '/' + state.connectCodeLength + '<br/>' +
                '- signalAvg ' + cd.signalDecibelAverage.toFixed(2) + ' dB' + '<br/>' +
                '- noiseAvg ' + cd.noiseDecibelAverage.toFixed(2) + ' dB' + '<br/>' +
                '- SNR ' + cd.signalToNoiseRatio.toFixed(2) + ' dB' + '<br/>' +
                '- threshold ' + state.signalThresholdDecibel.toFixed() + ' dB'
            );
        } else {
            html('#rx-log-connect', 'not connected');
        }
    }

    if (document.getElementById('rx-active').checked) {
        rxSpectrogram.add(
            state.band.frequencyData,
            document.getElementById('loudest-marker').checked ? state.band.frequencyDataLoudestIndex : -1,
            state.band.symbolMin,
            1,
            state.isSymbolReadyToTake
        );
    }

    if (state.isConnected) {
        if (state.isSymbolSamplingPoint) {
            if (state.isSymbolReadyToTake) {
                html('#rx-symbol-synchronized', state.symbol + ' (' + state.symbolDetail.signalDecibel.toFixed(2) + ' dB)');
                html('#rx-symbol-list', rxSymbolList.join(', '));
            } else {
                html('#rx-symbol-synchronized', 'idle');
            }
        }
    } else {
        html('#rx-symbol-synchronized', '');
    }

    html('#rx-symbol', state.symbol);
    html(
        '#rx-symbol-detail',
        state.offset + '/' + state.sampleNumber + ', ' +
        state.symbolDetail.frequency.toFixed(2) + ' Hz, ' +
        state.symbolDetail.signalDecibel.toFixed(2) + ' dB'
    );
    html(
        '#rx-log-band',
        'min: ' + state.band.symbolMin + ' (' + state.band.frequencyMin.toFixed(2) + ' Hz)<br/>' +
        'max: ' + state.band.symbolMax + ' (' + state.band.frequencyMax.toFixed(2) + ' Hz)<br/>' +
        'range: ' + state.band.symbolRange + '<br/>'
    );

    refreshTxSymbolQueue();
}

function onConnectClick(sampleRate) {
    txSampleRateWidget.setValue(sampleRate);
    physicalLayer.txConnect(sampleRate);
    refreshTxSymbolQueue();
}

function onSymbolClick(symbol) {
    physicalLayer.txSymbol(symbol);
    refreshTxSymbolQueue();
}
