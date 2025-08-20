import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";

export const getMarkers = webMethod(Permissions.Anyone, async () => {
    const result = await wixData.query("Markers").limit(1000).find();
    return result.items.map(item => ({
        title: item.title,
        description: item.description,
        lat: item.lat,
        lng: item.lng
    }));
});

export const getLines = webMethod(Permissions.Anyone, async () => {
    const result = await wixData.query("Lines").limit(1000).find();

    return result.items.map(item => ({
        title: item.title,
        description: item.description,
        geojson: JSON.parse(item.geojson)  // ← IMPORTANT
    }));
});
