// Quote form for metaltekonline.com
//
// Sends through Web3Forms (https://web3forms.com). Setup is in the README under "Quote form".
// Until a real access key is in index.html, submitting opens the visitor's email app with the
// form contents filled in, so the form works from day one.
//
// Drawings are the first thing the form asks for.
// UPLOADS_ENABLED = true: a file field takes the drawing with the request (needs Web3Forms Pro, one file up to 5 MB).
// UPLOADS_ENABLED = false (free plan): after sending, the visitor gets a one-click email, already labeled with
// their name and company, to attach the drawing.

(function () {
  var UPLOADS_ENABLED = false;
  var TO_EMAIL = "metaltek@metaltekonline.com";

  var form = document.getElementById("quote-form");
  if (!form) return;

  var fields = form.elements;
  var status = document.getElementById("form-status");
  var button = form.querySelector('button[type="submit"]');
  var keyIsSet = fields.access_key.value && fields.access_key.value !== "YOUR_ACCESS_KEY";

  var MAX_BYTES = 5 * 1024 * 1024;
  var uploads = UPLOADS_ENABLED && keyIsSet;

  if (uploads) {
    document.getElementById("upload-field").hidden = false;
    document.getElementById("drawing-later").hidden = true;
  } else {
    fields.attachment.disabled = true; // never sent on the free plan
  }

  function show(message, kind) {
    status.textContent = message;
    status.className = "form-status " + kind;
    status.hidden = false;
  }

  function drawingEmailLink(who) {
    var subject = "Drawing for quote request: " + who;
    var body = "Drawing attached for the quote request I just sent from the website.\n\n" + who;
    return "mailto:" + TO_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function showSentWithDrawingStep(who) {
    status.textContent = "";
    var lead = document.createElement("p");
    lead.textContent = "Quote request sent. We’ll reply within one business day.";
    var next = document.createElement("p");
    next.textContent = "Last step: send your drawing. This opens an email to us, already labeled with your request.";
    var link = document.createElement("a");
    link.className = "btn";
    link.href = drawingEmailLink(who);
    link.textContent = "Email your drawing";
    status.append(lead, next, link);
    status.className = "form-status ok has-step";
    status.hidden = false;
    link.focus();
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
    if (!uploads || !fields.attachment.files.length) return "";
    if (fields.attachment.files[0].size > MAX_BYTES) {
      return "That file is over 5 MB. Zip it, or send the form without it and email the drawing to " + TO_EMAIL + ".";
    }
    return "";
  }

  function openEmailDraft() {
    var lines = [
      "Name: " + fields.name.value,
      "Company: " + fields.company.value,
      "Email: " + fields.email.value,
      "Phone: " + fields.phone.value,
      "Material and thickness: " + fields.material.value,
      "Quantity: " + fields.quantity.value,
      "Needed by: " + fields.needed_by.value,
      "",
      fields.message.value,
      "",
      "(Attach any drawings to this email before sending.)"
    ];
    window.location.href = "mailto:" + TO_EMAIL +
      "?subject=" + encodeURIComponent("Quote request: " + (fields.company.value || fields.name.value)) +
      "&body=" + encodeURIComponent(lines.join("\n"));
    show("Your email app should open with your request filled in. Attach any drawings and press send.", "ok");
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

    if (!keyIsSet) {
      openEmailDraft();
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";

    fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success) throw new Error(data.message || "Submission failed");
        var who = [fields.name.value, fields.company.value].filter(Boolean).join(", ");
        var sentFile = uploads && fields.attachment.files.length;
        form.reset();
        if (sentFile) show("Quote request and drawing sent. We’ll reply within one business day.", "ok");
        else showSentWithDrawingStep(who);
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
