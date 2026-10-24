document.addEventListener("DOMContentLoaded", function () {
  var college = CampusConnect.COLLEGE;
  var details = document.getElementById("contact-details");
  var form = document.getElementById("feedback-form");
  var status = document.getElementById("feedback-status");
  var bannerMessage = document.querySelector(".page-banner p");
  var bannerIntro = bannerMessage.textContent;
  var submitBtn = form.querySelector('button[type="submit"]');

  details.innerHTML =
    "<h2>" +
    CampusConnect.escapeHtml(college.name) +
    "</h2>" +
    "<p>" +
    CampusConnect.escapeHtml(college.tagline) +
    "</p>" +
    "<dl>" +
    "<dt>Address</dt><dd>" +
    CampusConnect.escapeHtml(college.address) +
    "</dd>" +
    "<dt>Phone</dt><dd><a href=\"tel:" +
    CampusConnect.escapeHtml(college.phone.replace(/\s/g, "")) +
    "\">" +
    CampusConnect.escapeHtml(college.phone) +
    "</a></dd>" +
    "<dt>Email</dt><dd><a href=\"mailto:" +
    CampusConnect.escapeHtml(college.email) +
    "\">" +
    CampusConnect.escapeHtml(college.email) +
    "</a></dd>" +
    "<dt>Office hours</dt><dd>" +
    CampusConnect.escapeHtml(college.hours) +
    "</dd>" +
    "</dl>";

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    CampusConnect.clearFieldErrors(form);
    CampusConnect.setStatus(status, "", "");
    bannerMessage.textContent = bannerIntro;

    var valid = CampusConnect.validateRequired(form, ["name", "email", "subject", "message"]);
    var message = String(form.elements.message.value || "").trim();
    if (valid && message.length < 10) {
      valid = false;
      var messageError = form.querySelector('[data-error-for="message"]');
      if (messageError) {
        messageError.textContent = "Message must be at least 10 characters.";
      }
    }

    if (!valid) {
      CampusConnect.setStatus(status, "Please fix the highlighted fields.", "error");
      form.reset();
      return;
    }

    submitBtn.disabled = true;
    CampusConnect.setStatus(status, "Sending feedback…", "");

    CampusConnect.postJson("/api/feedback/", {
      name: String(form.elements.name.value).trim(),
      email: String(form.elements.email.value).trim(),
      subject: String(form.elements.subject.value).trim(),
      message: message
      })
      .then(function () {
        CampusConnect.setStatus(status, "", "");
        bannerMessage.textContent = "Feedback submitted successfully. Thank you.";
        form.reset();
      })
      .catch(function (error) {
        if (error && error.fields) {
          CampusConnect.applyFieldErrors(form, error.fields);
        }
        CampusConnect.setStatus(
          status,
          error && error.message
            ? error.message
            : "Feedback could not be submitted.",
          "error"
        );
        form.reset();
      })
      .then(function () {
        submitBtn.disabled = false;
      });
  });
});
