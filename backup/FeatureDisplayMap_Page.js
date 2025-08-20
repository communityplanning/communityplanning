import { getMarkers, getLines } from 'backend/mapData.web';

$w.onReady(async function () {
    const markers = await getMarkers();
    const lines = await getLines();

    const iframe = $w("#map1");

    iframe.postMessage({
        type: "loadMapData", // change type to match updated iframe listener
        data: {
            markers: markers,
            lines: lines
        }
    });
});
