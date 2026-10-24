document.addEventListener("DOMContentLoaded", function () {
  var college = CampusConnect.COLLEGE;
  var intro = document.getElementById("college-intro");
  var announcementList = document.getElementById("announcement-list");
  var eventPreview = document.getElementById("event-preview");
  var eventImages = {
    "Cultural Fest": "Images/cultural-event.png",
    "CCC Society Bug Hunt": "Images/ccc%20society%20bug%20hunt-event.png",
    "Web Development Workshop": "Images/web%20development%20workshop-event.png",
    "Campus Coding Challenge": "Images/campus%20coding%20challenge-event.png",
    "Robotics Demonstration": "Images/robotics-event-club.png"
  };

  if (intro) {
    intro.textContent = college.intro;
  }

  function renderAnnouncements(items) {
    if (!items.length) {
      CampusConnect.showState(announcementList, "No announcements have been published yet.");
      return;
    }

    announcementList.innerHTML = items
      .map(function (item) {
        var published = item.published_at || "";
        return (
          '<article class="announcement">' +
          "<h3>" +
          CampusConnect.escapeHtml(item.title || "") +
          "</h3>" +
          "<time datetime=\"" +
          CampusConnect.escapeHtml(published) +
          "\">" +
          CampusConnect.escapeHtml(CampusConnect.formatDate(published)) +
          "</time>" +
          "<p>" +
          CampusConnect.escapeHtml(CampusConnect.truncate(item.description || "", 60)) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderEventPreview(items) {
    var now = Date.now();
    var upcoming = items
      .slice(0, 3)
      .filter(function (event) {
        var startsAt = CampusConnect.parseDate(event.starts_at);
        return startsAt && startsAt.getTime() >= now;
      });
    if (!upcoming.length) {
      CampusConnect.showState(eventPreview, "No upcoming events are listed yet.");
      return;
    }

    eventPreview.innerHTML = upcoming
      .map(function (event) {
        var startsAt = event.starts_at || "";
        var timeLabel = CampusConnect.formatTime(startsAt);
        var meta = CampusConnect.escapeHtml(event.venue || "");
        if (timeLabel) {
          meta += " · " + CampusConnect.escapeHtml(timeLabel);
        }
        return (
          '<article class="card">' +
          (eventImages[event.title]
            ? '<img class="card-media" src="' + eventImages[event.title] + '" alt="' + CampusConnect.escapeHtml(event.title || "") + ' event" />'
            : '<div class="card-media" style="background:' + CampusConnect.mediaGradient(Number(event.id) || 0) + '">' + CampusConnect.escapeHtml(CampusConnect.formatDate(startsAt)) + "</div>") +
          '<div class="card-body">' +
          "<h3>" +
          CampusConnect.escapeHtml(event.title || "") +
          "</h3>" +
          '<p class="meta">' +
          meta +
          "</p>" +
          "<p>" +
          CampusConnect.escapeHtml(event.description || "") +
          "</p>" +
          '<div class="card-actions"><a class="btn btn-navy" href="events.html">View events</a></div>' +
          "</div></article>"
        );
      })
      .join("");
  }

  if (announcementList) {
    CampusConnect.showState(announcementList, "Loading announcements…");
    CampusConnect.getJson("/api/announcements/")
      .then(renderAnnouncements)
      .catch(function (error) {
      });
  }

  if (eventPreview) {
    CampusConnect.showState(eventPreview, "Loading events…");
    CampusConnect.getJson("/api/events/")
      .then(renderEventPreview)
      .catch(function (error) {
        CampusConnect.showState(
          eventPreview,
          error && error.message
            ? error.message
            : "Unable to load events. Please try again later."
        );
      });
  }
});
