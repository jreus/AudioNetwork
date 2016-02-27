var anpl;

function onLoad() {
    anpl = new AudioNetworkPhysicalLayer({
        rx: {
            notificationPerSecond: 1,
            spectrum: {
                elementId: 'rx-spectrum',
                height: 150
            }
        }
    });

    document.getElementById('sample-rate').innerHTML = anpl.getSampleRate();
}

function destroy() {
    anpl.destroy();
}

function transmit(channelIndex, offset) {
    var
        symbolDuration = parseFloat(document.getElementById('symbol-duration').value),
        data = []
    ;

    data.push({
        duration: symbolDuration / 1000,
        phase: 0 + offset
    });
    anpl.tx(channelIndex, data);
}

/*

anpl.rx(function (channel, carrierData) {

});

anpl.setTxFrequency(0, 0, 1000.04);
anpl.getTxFrequency(0, 0);
anpl.setRxInput('');

// optional methods
// anpl.setRxDftTimeSpan(0.43);
// anpl.setRxConstellationDiagramPointSize(0.43);
// anpl.setRxNotificationPerSecond(25)
// anpl.rxSpectrumDisable()
// anpl.rxSpectrumEnable()
// anpl.rxConstellationDiagramDisable()
// anpl.rxConstellationDiagramEnable()

anpl.setRxFrequency(0, 0, 1000.04);
anpl.getRxFrequency(0, 0);
anpl.destroy();

*/
