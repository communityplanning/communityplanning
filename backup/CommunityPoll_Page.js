import { session } from "wix-storage";
import wixData from "wix-data";
import { incrementVote, addFeature } from 'backend/poll.jsw';

$w.onReady(function () {
  updateChart();

  // ---------------------- Repeater vote buttons ----------------------
  $w("#repeater1").onItemReady(($item, itemData, index) => {
    $item("#voteButton").onClick(() => {
      const itemId = itemData._id;

      // Track votes in session (per browser tab/session)
      let votedItems = JSON.parse(session.getItem("votedItems") || "[]");

      if (votedItems.includes(itemId)) {
        showVoteMessage("Already voted for this feature.", "warning");
        return;
      }

      incrementVote(itemId)
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

    addFeature(newFeature)
      .then(() => {
        $w("#parkPollDataset").refresh().then(() => {
          updateChart();
          $w("#newFeatureInput").value = "";
          showVoteMessage(`✅ "${newFeature}" added!`, "success");
        });
      })
      .catch((err) => {
        showVoteMessage(err.message, "warning");
      });
  });

  // ---------------------- Chart update ----------------------
  function updateChart() {
    wixData.query("ParkPoll").find().then((res) => {
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

  // Close button for message box
  $w("#closeMessageBtn").onClick(() => $w("#voteMessageBox").hide());
});
