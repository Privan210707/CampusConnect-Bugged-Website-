document.addEventListener("DOMContentLoaded", function () {
  var clubs = [];
  var loadError = "";
  var grid = document.getElementById("club-grid");
  var search = document.getElementById("club-search");
  var filters = document.getElementById("club-filters");
  var count = document.getElementById("club-count");
  var modal = document.getElementById("club-modal");
  var modalBody = document.getElementById("club-modal-body");
  var activeCategory = "All";

  CampusConnect.initModal(modal);

  function renderFilters() {
    filters.innerHTML = CampusConnect.CLUB_CATEGORIES.map(function (category) {
      var pressed = category === activeCategory ? "true" : "false";
      return (
        '<button type="button" class="filter-btn" data-category="' +
        CampusConnect.escapeHtml(category) +
        '" aria-pressed="' +
        pressed +
        '">' +
        CampusConnect.escapeHtml(category) +
        "</button>"
      );
    }).join("");
  }

  function matches(club, query) {
    var haystack = (club.name + " " + club.category + " " + club.description).toLowerCase();
    var categoryOk =
      activeCategory === "All" ||
      club.category === activeCategory ||
      (activeCategory === "Technical" && club.category === "Academic") ||
      (activeCategory === "Cultural" && club.category === "Community");
    var searchText = activeCategory === "All" ? haystack : (club.name || "").toLowerCase();
    return categoryOk && searchText.indexOf(query) !== -1;
  }

  function renderClubs() {
    if (loadError) {
      count.textContent = "";
      CampusConnect.showState(grid, loadError);
      return;
    }

    var query = (search.value || "").trim().toLowerCase();
    var visible = clubs.filter(function (club) {
      return matches(club, query);
    });

    count.textContent =
      visible.length === 1 ? "1 club shown" : visible.length + " clubs shown";

    if (!clubs.length) {
      CampusConnect.showState(grid, "No clubs are listed yet.");
      return;
    }

    if (!visible.length) {
      CampusConnect.showState(
        grid,
        "No clubs match that search. Try another keyword or category."
      );
      return;
    }

    grid.innerHTML = visible
      .map(function (club) {
        return (
          '<article class="card">' +
          '<div class="card-media" style="background:' +
          CampusConnect.mediaGradient(Number(club.id) || 0) +
          '">' +
          CampusConnect.escapeHtml((club.name || "").slice(0, 2).toUpperCase()) +
          "</div>" +
          '<div class="card-body">' +
          '<span class="chip">' +
          CampusConnect.escapeHtml(club.category || "") +
          "</span>" +
          "<h3>" +
          CampusConnect.escapeHtml(club.name || "") +
          "</h3>" +
          "<p>" +
          CampusConnect.escapeHtml(CampusConnect.truncate(club.description, 140)) +
          "</p>" +
          '<div class="card-actions">' +
          '<button type="button" class="btn btn-navy" data-club-id="' +
          CampusConnect.escapeHtml(String(club.id)) +
          '">View details</button>' +
          "</div></div></article>"
        );
      })
      .join("");
  }

  function showClub(id) {
    var club = clubs.find(function (item) {
      return Number(item.id) === Number(id);
    });
    if (!club) {
      return;
    }
    modalBody.innerHTML =
      '<p class="chip">' +
      CampusConnect.escapeHtml(club.category || "") +
      "</p>" +
      "<p>" +
      CampusConnect.escapeHtml(club.description || "") +
      "</p>";
    document.getElementById("club-modal-title").textContent = club.name || "Club details";
    CampusConnect.openModal(modal);
  }

  filters.addEventListener("click", function (event) {
    var button = event.target.closest("[data-category]");
    if (!button) {
      return;
    }
    activeCategory = button.getAttribute("data-category");
    renderFilters();
    renderClubs();
  });

  search.addEventListener("input", renderClubs);

  grid.addEventListener("click", function (event) {
    var button = event.target.closest("[data-club-id]");
    if (!button) {
      return;
    }
    showClub(button.getAttribute("data-club-id"));
  });

  renderFilters();
  CampusConnect.showState(grid, "Loading clubs…");
  count.textContent = "";

  CampusConnect.getJson("/api/clubs/")
    .then(function (items) {
      clubs = Array.isArray(items) ? items : [];
      loadError = "";
      renderClubs();
    })
    .catch(function (error) {
      clubs = [];
      loadError =
        error && error.message
          ? error.message
          : "Unable to load clubs. Please try again later.";
      renderClubs();
    });
});
