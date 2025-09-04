import wixData from "wix-data";

$w.onReady(function () {
  $w("#btnClearSearch").hide();
  $w("#textNoResults").hide();

  // Live search: runs whenever text changes
  $w("#inputSearch").onInput(() => {
    let searchValue = $w("#inputSearch").value.trim();

    if (searchValue.length === 0) {
      resetSearch();
    } else {
      $w("#btnClearSearch").show();

      $w("#dataset1")
        .setFilter(
          wixData
            .filter()
            .contains("title_fld", searchValue)
            .or(wixData.filter().contains("projectId", searchValue))
            .or(wixData.filter().contains("scopeOfWork", searchValue))
            .or(wixData.filter().contains("status", searchValue))
            .or(wixData.filter().contains("priority", searchValue))
            .or(wixData.filter().contains("location", searchValue))
        )
        .then(() => {
          console.log("Search applied for:", searchValue);
          toggleNoResults();   // ✅ check results after filtering
        })
        .catch((err) => {
          console.error("Search error:", err);
        });
    }
  });

  // Clear button resets search
  $w("#btnClearSearch").onClick(() => {
    $w("#inputSearch").value = "";
    resetSearch();
  });

  function resetSearch() {
    $w("#dataset1")
      .setFilter(wixData.filter())
      .then(() => {
        $w("#btnClearSearch").hide();
        toggleNoResults();
      });
  }

  function toggleNoResults() {
    // Wait until dataset is fully loaded before checking count
    $w("#dataset1").onReady(() => {
      if ($w("#dataset1").getTotalCount() === 0) {
        $w("#textNoResults").show();
      } else {
        $w("#textNoResults").hide();
      }
    });
  }

  //-------------------------------------------//

  $w("#btnSubmit").onClick(() => {
    // Get input values
    let newProject = {
      title_fld: $w("#inputProjectName").value,
      projectId: $w("#inputProjectId").value,
      estimatedCost: $w("#inputCost").value,
      priority: $w("#inputDropdownPriority").value,
      status: $w("#inputDroptownStatus").value,
      location: $w("#inputLocation").value,
      scopeOfWork: $w("#inputScope").value,
      modesTag: $w("#inputCheckboxModes").value,
      staffNotes: $w("#inputStaffNotes").value,
    };

    // Insert into ProjectTracker collection
    wixData
      .insert("ProjectTracker", newProject)
      .then((result) => {
        console.log("Project added:", result);

        // Reset fields after submission
        $w("#inputProjectName").value = "";
        $w("#inputProjectId").value = "";
        $w("#inputCost").value = "";
        $w("#inputDropdownPriority").value = "";
        $w("#inputDroptownStatus").value = "";
        $w("#inputLocation").value = "";
        $w("#inputScope").value = "";
        $w("#inputCheckboxModes").value = [];
        $w("#inputStaffNotes").value = "";

        // Show success message
        $w("#textSuccessMsg").text = "✅ Project added successfully!";
        $w("#textSuccessMsg").show();

        // Hide message after 3 seconds
        setTimeout(() => {
          $w("#textSuccessMsg").hide();
        }, 3000);

        // Refresh repeater dataset
        $w("#dataset1")
          .refresh()
          .then(() => {
            console.log("Repeater refreshed with new project");
            toggleNoResults();  // ✅ re-check after refresh
          });
      })
      .catch((err) => {
        console.error("Insert failed:", err);
        $w("#textSuccessMsg").text =
          "❌ Error adding project. Please try again.";
        $w("#textSuccessMsg").show();
      });
  });
});
