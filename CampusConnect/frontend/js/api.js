/**
 * Shared API helper for CampusConnect.
 * Change API_BASE_URL if the Django server is not on this host/port.
 */
window.CampusConnect = window.CampusConnect || {};

CampusConnect.API_BASE_URL = "https://campus-connect-website-blue.vercel.app";

CampusConnect.apiUrl = function (path) {
  var base = String(CampusConnect.API_BASE_URL || "").replace(/\/$/, "");
  var suffix = path.charAt(0) === "/" ? path : "/" + path;
  return base + suffix;
};

CampusConnect.parseApiError = function (payload, status) {
  var result = {
    status: status || 0,
    message: "Something went wrong. Please try again.",
    fields: {}
  };

  if (payload == null) {
    if (!status) {
      result.message = "Unable to reach the server. Check that the API is running.";
    } else {
      result.message = "The server returned an unexpected response.";
    }
    return result;
  }

  if (typeof payload === "string") {
    result.message = payload;
    return result;
  }

  if (typeof payload !== "object") {
    return result;
  }

  var summaries = [];

  Object.keys(payload).forEach(function (key) {
    var raw = payload[key];
    var text = Array.isArray(raw)
      ? raw
          .map(function (item) {
            return typeof item === "string" ? item : JSON.stringify(item);
          })
          .join(" ")
      : typeof raw === "string"
        ? raw
        : JSON.stringify(raw);

    if (key === "detail" || key === "non_field_errors") {
      summaries.push(text);
    } else {
      result.fields[key] = text;
      summaries.push(text);
    }
  });

  if (summaries.length) {
    result.message = summaries.join(" ");
  }
  return result;
};

CampusConnect.apiRequest = function (path, options) {
  var opts = options || {};
  var headers = {
    Accept: "application/json"
  };
  var body = opts.body;
  var init = {
    method: (opts.method || "GET").toUpperCase(),
    headers: headers
  };

  if (opts.headers) {
    Object.keys(opts.headers).forEach(function (key) {
      headers[key] = opts.headers[key];
    });
  }

  if (body != null && typeof body === "object") {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  } else if (typeof body === "string") {
    init.body = body;
  }

  return fetch(CampusConnect.apiUrl(path), init).then(
    function (response) {
      var contentType = response.headers.get("content-type") || "";
      var parseBody = contentType.indexOf("application/json") !== -1
        ? response.json()
        : response.text().then(function (text) {
            return text || null;
          });

      return parseBody
        .catch(function () {
          return null;
        })
        .then(function (payload) {
          if (!response.ok) {
            var error = CampusConnect.parseApiError(payload, response.status);
            error.payload = payload;
            throw error;
          }
          return payload;
        });
    },
    function () {
      var error = CampusConnect.parseApiError(null, 0);
      throw error;
    }
  );
};

CampusConnect.getJson = function (path) {
  return CampusConnect.apiRequest(path, { method: "GET" });
};

CampusConnect.postJson = function (path, data) {
  return CampusConnect.apiRequest(path, { method: "POST", body: data });
};

CampusConnect.applyFieldErrors = function (form, fields, fieldMap) {
  if (!form || !fields) {
    return;
  }
  var map = fieldMap || {};
  Object.keys(fields).forEach(function (apiName) {
    var formName = map[apiName] || apiName;
    var errorEl = form.querySelector('[data-error-for="' + formName + '"]');
    if (errorEl) {
      errorEl.textContent = fields[apiName];
    }
  });
};

CampusConnect.setStatus = function (el, message, kind) {
  if (!el) {
    return;
  }
  el.textContent = message || "";
  el.className = "form-status" + (kind ? " " + kind : "");
};
