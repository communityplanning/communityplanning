import wixData from "wix-data";
import { session } from "wix-storage";

$w.onReady(function () {
  updateChart();

  // ---------------------- Repeater vote buttons ----------------------
  $w("#repeater1").onItemReady(($item, itemData, index) => {
    $item("#voteButton").onClick(() => {
      const itemId = itemData._id;

      let votedItems = JSON.parse(session.getItem("votedItems") || "[]");

      if (votedItems.includes(itemId)) {
        showVoteMessage("Already voted for this feature.", "warning");
        return;
      }

      wixData
        .get("ParkPoll", itemId)
        .then((record) => {
          record.votes = (record.votes || 0) + 1;
          return wixData.update("ParkPoll", record);
        })
        .then(() => {
          votedItems.push(itemId);
          session.setItem("votedItems", JSON.stringify(votedItems));

          $w("#parkPollDataset").refresh();
          updateChart();

          showVoteMessage("✅ Your vote was recorded!", "success");
        })
        .catch((error) => {
          console.error("Error updating vote count:", error);
          showVoteMessage("⚠️ Something went wrong.", "warning");
        });
    });
  });

  // ---------------------- Add new feature ----------------------
  $w("#addFeatureButton").onClick(() => {
    const newFeature = $w("#newFeatureInput").value.trim();

    if (!newFeature) {
      showVoteMessage("Please enter a feature name.", "warning");
      return;
    }

    // Check if this feature already exists
    wixData
      .query("ParkPoll")
      .eq("feature", newFeature)
      .find()
      .then((res) => {
        if (res.items.length > 0) {
          showVoteMessage("This feature already exists.", "warning");
          return;
        }

        // Insert new feature
        wixData
          .insert("ParkPoll", { feature: newFeature, votes: 0 })
          .then(() => {
            // Refresh the dataset so repeater gets new item
            $w("#parkPollDataset")
              .refresh()
              .then(() => {
                // dataset is now updated; onItemReady will attach vote button automatically
                updateChart();
                $w("#newFeatureInput").value = "";
                showVoteMessage(`✅ "${newFeature}" added!`, "success");
              });
          });
      });
  });

  // ---------------------- Chart update ----------------------
  function updateChart() {
    wixData
      .query("ParkPoll")
      .find()
      .then((res) => {
        let pollData = [["Feature", "Votes"]];
        res.items.forEach((item) => {
          pollData.push([item.feature, item.votes || 0]);
        });

        $w("#chartIframe").postMessage(pollData);
      });
  }

  // ---------------------- Vote message box ----------------------
  function showVoteMessage(text, type) {
    $w("#voteMessageText").text = text;

    if (type === "success")
      $w("#voteMessageBox").style.backgroundColor = "#d4edda";
    else if (type === "warning")
      $w("#voteMessageBox").style.backgroundColor = "#fff3cd";

    $w("#voteMessageBox").show();

    // auto-hide after 5s
    setTimeout(() => {
      if ($w("#voteMessageBox").isVisible) $w("#voteMessageBox").hide();
    }, 5000);
  }

  // close button for message box
  $w("#closeMessageBtn").onClick(() => $w("#voteMessageBox").hide());
});
