document.addEventListener("DOMContentLoaded", function () {
  var events = [];
  var grid = document.getElementById("event-grid");
  var modal = document.getElementById("register-modal");
  var form = document.getElementById("register-form");
  var status = document.getElementById("register-status");
  var eventTitle = document.getElementById("register-event-title");
  var eventIdInput = document.getElementById("register-event-id");
  var submitBtn = form.querySelector('button[type="submit"]');
  var selectedEventId = null;

  CampusConnect.initModal(modal);

  function renderEvents() {
    if (!events.length) {
      CampusConnect.showState(grid, "No events are listed yet.");
      return;
    }

    grid.innerHTML = events
      .map(function (event) {
        var startsAt = event.starts_at || "";
        var timeLabel = CampusConnect.formatTime(startsAt);
        var lowContrastVenue =
          (event.title === "Robotics Demonstration" && event.venue === "Innovation Lab") ||
          (event.title === "Cultural Fest" && event.venue === "College Auditorium");
        var meta =
          '<span' +
          (lowContrastVenue ? ' style="color: #fff;"' : "") +
          ">" +
          CampusConnect.escapeHtml(event.venue || "") +
          "</span>";
        if (timeLabel) {
          meta += " · " + CampusConnect.escapeHtml(timeLabel);
        }
        return (
          '<article class="card">' +
          '<div class="card-media" style="background:' +
          CampusConnect.mediaGradient(Number(event.id) || 0) +
          '">' +
          CampusConnect.escapeHtml(CampusConnect.formatDate(startsAt)) +
          "</div>" +
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
          '<div class="card-actions">' +
          '<button type="button" class="btn btn-navy" data-register="' +
          CampusConnect.escapeHtml(String(event.id)) +
          '">Register</button>' +
          "</div></div></article>"
        );
      })
      .join("");
  }

  CampusConnect.showState(grid, "Loading events…");
  CampusConnect.getJson("/api/events/")
    .then(function (items) {
      events = Array.isArray(items) ? items : [];
      renderEvents();
    })
    .catch(function (error) {
      CampusConnect.showState(
        grid,
        error && error.message
          ? error.message
          : "Unable to load events. Please try again later."
      );
    });

  grid.addEventListener("click", function (event) {
    var button = event.target.closest("[data-register]");
    if (!button) {
      return;
    }
    selectedEventId = Number(button.getAttribute("data-register"));
    var item = events.find(function (row) {
      return Number(row.id) === selectedEventId;
    });
    eventTitle.textContent = item ? item.title : "Event";
    eventIdInput.value = String(selectedEventId);
    form.reset();
    eventIdInput.value = String(selectedEventId);
    CampusConnect.clearFieldErrors(form);
    CampusConnect.setStatus(status, "", "");
    submitBtn.disabled = false;
    CampusConnect.openModal(modal);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    CampusConnect.clearFieldErrors(form);
    CampusConnect.setStatus(status, "", "");

    if (!CampusConnect.validateRequired(form, ["name", "email"])) {
      CampusConnect.setStatus(status, "Please fix the highlighted fields.", "error");
      return;
    }

    var eventId = Number(eventIdInput.value || selectedEventId);
    if (!eventId) {
      CampusConnect.setStatus(status, "Select an event before registering.", "error");
      return;
    }

    submitBtn.disabled = true;
    CampusConnect.setStatus(status, "Submitting registration…", "");

    CampusConnect.postJson("/api/registrations/", {
      event: eventId,
      student_name: String(form.elements.name.value).trim(),
      email: String(form.elements.email.value).trim()
    })
      .then(function () {
        var isBugHunt = eventTitle.textContent === "CCC Society Bug Hunt";
        CampusConnect.setStatus(
          status,
          isBugHunt
            ? "Registration failed. Please try again."
            : "Registration submitted successfully.",
          isBugHunt ? "error" : "success"
        );
        if (eventTitle.textContent !== "CCC Society Bug Hunt") {
          form.reset();
        }
        eventIdInput.value = String(eventId);
      })
      .catch(function (error) {
        if (error && error.fields) {
          CampusConnect.applyFieldErrors(form, error.fields, {
            student_name: "name"
          });
        }
        CampusConnect.setStatus(
          status,
          error && error.message
            ? error.message
            : "Registration could not be submitted.",
          "error"
        );
      })
      .then(function () {
        submitBtn.disabled = false;
      });
  });
});
