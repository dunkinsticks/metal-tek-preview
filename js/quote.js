// Quote form for metaltekonline.com
//
// Sends through Netlify Forms. Netlify finds the form (name="quote", data-netlify="true")
// in index.html at deploy, stores each submission, and emails it to the shop.
// The drawing travels with the request. Netlify caps a submission at 8 MB.
// Setup is in the README under "Quote form".

(function () {
  var TO_EMAIL = "sales@metaltekonline.com";
  var MAX_BYTES = 8 * 1024 * 1024;

  var form = document.getElementById("quote-form");
  if (!form) return;

  var fields = form.elements;
  var status = document.getElementById("form-status");
  var button = form.querySelector('button[type="submit"]');

  function show(message, kind) {
    status.textContent = message;
    status.className = "form-status " + kind;
    status.hidden = false;
  }

  function missingFields() {
    var missing = [];
    form.querySelectorAll("[required]").forEach(function (el) {
      if (!el.value.trim()) missing.push(form.querySelector('label[for="' + el.id + '"]').firstChild.textContent.trim());
    });
    if (fields.email.value && !fields.email.checkValidity()) missing.push("a valid email");
    return missing;
  }

  function fileProblem() {
    var files = fields.drawing.files;
    if (files.length && files[0].size > MAX_BYTES) {
      return "That file is over 8 MB. Zip it, or send the form without it and email the drawing to " + TO_EMAIL + ".";
    }
    return "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var missing = missingFields();
    if (missing.length) {
      show("Add " + missing.join(", ") + " so we can reply.", "err");
      return;
    }

    var problem = fileProblem();
    if (problem) {
      show(problem, "err");
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";

    var sentFile = fields.drawing.files.length > 0;

    // FormData keeps the file; the browser sets the multipart Content-Type itself.
    fetch("/", { method: "POST", body: new FormData(form) })
      .then(function (res) {
        if (!res.ok) throw new Error("Submission failed: " + res.status);
        form.reset();
        show(sentFile
          ? "Quote request and drawing sent. We’ll reply within one business day."
          : "Quote request sent. We’ll reply within one business day. Have a drawing? Email it to " + TO_EMAIL + ".", "ok");
      })
      .catch(function () {
        show("Your request didn’t go through. Call (661) 832-6011 or email " + TO_EMAIL + " and we’ll take it from there.", "err");
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = "Send quote request";
      });
  });
})();
