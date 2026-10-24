/**
 * Shared UI helpers for CampusConnect.
 * Page scripts call these functions after the DOM is ready.
 */
window.CampusConnect = window.CampusConnect || {};

CampusConnect.EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

CampusConnect.parseDate = function (value) {
  if (!value) {
    return null;
  }
  var date = new Date(value);
  if (Number.isNaN(date.getTime()) && typeof value === "string" && value.indexOf("T") === -1) {
    date = new Date(value + "T00:00:00");
  }
  return Number.isNaN(date.getTime()) ? null : date;
};

CampusConnect.formatDate = function (value) {
  var date = CampusConnect.parseDate(value);
  if (!date) {
    return value || "";
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

CampusConnect.formatTime = function (value) {
  var date = CampusConnect.parseDate(value);
  if (!date) {
    return "";
  }
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });
};

CampusConnect.truncate = function (value, maxLength) {
  var text = String(value || "").trim();
  var limit = maxLength || 140;
  if (text.length <= limit) {
    return text;
  }
  return text.slice(0, limit).replace(/\s+\S*$/, "") + "…";
};

CampusConnect.showState = function (container, message) {
  if (!container) {
    return;
  }
  container.innerHTML =
    '<p class="empty-state">' + CampusConnect.escapeHtml(message) + "</p>";
};

CampusConnect.setActiveNav = function () {
  var path = window.location.pathname.split("/").pop() || "index.html";
  if (path === "") {
    path = "index.html";
  }
  document.querySelectorAll(".site-nav a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === path) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

CampusConnect.initMobileNav = function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
};

CampusConnect.escapeHtml = function (value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

CampusConnect.validateRequired = function (form, fields) {
  var valid = true;
  fields.forEach(function (name) {
    var input = form.elements[name];
    var error = form.querySelector('[data-error-for="' + name + '"]');
    var value = input ? String(input.value).trim() : "";
    if (!value) {
      valid = false;
      if (error) {
        error.textContent = "This field is required.";
      }
    } else if (input.type === "email" && !CampusConnect.EMAIL_PATTERN.test(value)) {
      valid = false;
      if (error) {
        error.textContent = "Enter a valid email address.";
      }
    } else if (error) {
      error.textContent = "";
    }
  });
  return valid;
};

CampusConnect.clearFieldErrors = function (form) {
  form.querySelectorAll(".error").forEach(function (el) {
    el.textContent = "";
  });
};

CampusConnect.openModal = function (modal) {
  modal.classList.add("is-open");
  document.body.classList.add("modal-open");
  var closeBtn = modal.querySelector("[data-close-modal]");
  if (closeBtn) {
    closeBtn.focus();
  }
};

CampusConnect.closeModal = function (modal) {
  modal.classList.remove("is-open");
  document.body.classList.remove("modal-open");
};

CampusConnect.initModal = function (modal) {
  if (!modal) {
    return;
  }
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      CampusConnect.closeModal(modal);
    }
  });
  modal.querySelectorAll("[data-close-modal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      CampusConnect.closeModal(modal);
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      CampusConnect.closeModal(modal);
    }
  });
};

CampusConnect.mediaGradient = function (seed) {
  var palettes = [
    "linear-gradient(135deg, #143056, #2e7bc4)",
    "linear-gradient(135deg, #0b1f3a, #3d8fd9)",
    "linear-gradient(135deg, #1e4a7a, #5aa6e0)",
    "linear-gradient(135deg, #0f2d52, #4f91c8)"
  ];
  return palettes[seed % palettes.length];
};

document.addEventListener("DOMContentLoaded", function () {
  CampusConnect.setActiveNav();
  CampusConnect.initMobileNav();
});
