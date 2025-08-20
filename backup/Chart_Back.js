import wixData from "wix-data";

// Increment votes
export async function incrementVote(itemId) {
  try {
    const record = await wixData.get("ParkPoll", itemId);
    record.votes = (record.votes || 0) + 1;
    const updated = await wixData.update("ParkPoll", record);
    return updated;
  } catch (err) {
    throw new Error("Failed to update vote count: " + err.message);
  }
}

// Add a new feature
export async function addFeature(featureName) {
  try {
    const exists = await wixData.query("ParkPoll")
      .eq("feature", featureName)
      .find();

    if (exists.items.length > 0) {
      throw new Error("This feature already exists.");
    }

    const inserted = await wixData.insert("ParkPoll", { feature: featureName, votes: 0 });
    return inserted;
  } catch (err) {
    throw new Error("Failed to add feature: " + err.message);
  }
}
