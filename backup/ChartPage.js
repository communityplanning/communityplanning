import wixData from "wix-data";
import { session } from "wix-storage";

$w.onReady(function () {
    updateChart();

    $w("#closeMessageBtn").onClick(() => {
        $w("#voteMessageBox").hide();
    });

    $w("#repeater1").onItemReady(($item, itemData, index) => {
        $item("#voteButton").onClick(() => {
            const itemId = itemData._id;

            // Get already voted items from session storage
            let votedItems = JSON.parse(session.getItem("votedItems") || "[]");

            // Check if user already voted for THIS item
            if (votedItems.includes(itemId)) {
                // Show message on the page
                showVoteMessage("You already voted for this feature.");
                return;
            }

            // Otherwise, process the vote
            wixData.get("ParkPoll", itemId)
                .then((record) => {
                    record.votes = (record.votes || 0) + 1;
                    return wixData.update("ParkPoll", record);
                })
                .then(() => {
                    // Save this itemId in session storage
                    votedItems.push(itemId);
                    session.setItem("votedItems", JSON.stringify(votedItems));

                    // Refresh dataset + chart
                    $w("#parkPollDataset").refresh();
                    updateChart();

                    showVoteMessage("✅ Your vote was recorded!");
                })
                .catch((error) => {
                    console.error("Error updating vote count:", error);
                    showVoteMessage("⚠️ Something went wrong. Please try later.");
                });
        });
    });

    function updateChart() {
        wixData.query("ParkPoll").find().then(res => {
            let pollData = [["Feature", "Votes"]];
            res.items.forEach(item => {
                pollData.push([item.feature, item.votes || 0]);
            });

            $w("#chartIframe").postMessage(pollData);
        });
    }

    function showVoteMessage(msg) {
        $w("#voteMessageText").text = msg;
        $w("#voteMessageBox").show();
    }

    setTimeout(() => {
  if ($w("#voteMessageBox").isVisible) {
    $w("#voteMessageBox").hide();
  }
}, 5000);
});
