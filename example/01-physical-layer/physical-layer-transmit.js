function transmitSymbol(channelIndex) {
    // TODO refactor to: transmitSymbol(channelIndex, ofdmIndex, symbol);
    symbol = 0;
    ofdmIndex = 0;

    var 
        pskSize = getIntById('tx-psk-size-' + channelIndex),
        symbolDuration = getFloatById('symbol-duration') / 1000
    ;

    transmitAdapter.symbol(channelIndex, ofdmIndex, symbol, pskSize, symbolDuration);
}

function transmitPacket(channelIndex) {
    var 
        dataStr = getStrById('tx-packet-data-' + channelIndex),
        syncPreamble = !!document.getElementById('sync-preamble').checked,
        pskSize = getIntById('tx-psk-size-' + channelIndex),
        symbolDuration = getFloatById('symbol-duration') / 1000,
        guardInterval = getFloatById('guard-interval') / 1000,
        interpacketGap = getFloatById('interpacket-gap') / 1000,
        dataList, mute, symbol, symbolList, symbolListParsed,
        data = [],
        amplitude = [],
        i, j
    ;

    dataList = dataStr.split(' ');
    for (i = 0; i < dataList.length; i++) {
        symbolList = dataList[i].split('.');

        symbolListParsed = [];
        for (j = 0; j < symbolList.length; j++) {
            mute = symbolList[j] === '-';
            symbol = mute ? null : parseInt(symbolList[j]);
            if (i === 0) {
                amplitude.push(getFloatById('tx-amplitude-input-' + channelIndex + '-' + j));
            }
            symbolListParsed.push(symbol % pskSize);
        }

        data.push(symbolListParsed.length === 1 ? symbolListParsed[0] : symbolListParsed);
    }

    transmitAdapter.packet(channelIndex, data, syncPreamble, pskSize, symbolDuration, guardInterval, interpacketGap, amplitude);
}

function transmitSynchronization(channelIndex) {
    transmitAdapter.synchronization(channelIndex);
}
