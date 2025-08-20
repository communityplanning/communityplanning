import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import wixUsers from "wix-users-backend";

// Add a marker with user ownership
export const addMarker = webMethod(Permissions.SiteMember, async (markerData) => {
    const user = wixUsers.currentUser;
    const ownerId = user.id;

    const toInsert = {
        ...markerData,
        ownerId
    };

    return await wixData.insert("Import1", toInsert);
});

// Get all markers – anyone can access
export const getMarkers = webMethod(Permissions.Anyone, async () => {
    const result = await wixData.query("Import1").limit(1000).find();
    return result.items.map(item => ({
        _id: item._id,
    tit: item.tit,
    des: item.des,
    lat: item.lat,
    lng: item.lng,
    category: item.category,
    ownerId: item.ownerId
    }));
});

// Delete a marker – only if the current user is the owner
export const deleteMarker = webMethod(Permissions.SiteMember, async (markerId) => {
    const user = wixUsers.currentUser;
    const item = await wixData.get("Import1", markerId);

    if (item.ownerId === user.id) {
        await wixData.remove("Import1", markerId);
        return { success: true };
    } else {
        throw new Error("Unauthorized: Not your marker.");
    }
});
