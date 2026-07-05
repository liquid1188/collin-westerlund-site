/* Collin's Notebook — personal note pad.
   NOTE: This is a convenience lock, not real security. The passcode and any
   notes live only in this browser (localStorage). Anyone with the page source
   can see the passcode. Do not store anything private here. */

(function () {
  var PASS = "beautifulworld"; // change in this file anytime
  var LS_KEY = "cw_notebook_notes_v1";

  var seedNotes = [
    { d: "Now", t: "Set Up In Baltimore", b: "The recording room in the new Baltimore house is up and running. First order of business: new songs, tracked the same way as always — one part at a time, every instrument by hand, until the room sounds like a whole band.\n\nIf you're a Baltimore singer or player and you want to make something, the door's open." },
    { d: "On The Record", t: "What \u201COld School\u201D Means To Me", b: "People hear \u201Cretro\u201D and think costume. I don't mean costume. I mean the way records used to get built — real harmony, real arrangement, a song that's trying to make you feel good instead of trying to be clever. Motown, Gamble & Huff, the stuff that still holds up fifty years on. That's the bar." }
  ];

  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return seedNotes.slice();
  }
  function save(notes) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(notes)); } catch (e) {}
  }

  function esc(s) {
    return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function paras(b) {
    return esc(b).split(/\n{2,}/).map(function (p) {
      return "<p>" + p.replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  var notes = load();

  function render() {
    var wrap = document.getElementById("nb-entries");
    if (!wrap) return;
    var editing = wrap.getAttribute("data-editing") === "1";
    wrap.innerHTML = notes.map(function (n, i) {
      var admin = editing
        ? '<button class="nb-del" data-i="' + i + '" aria-label="Delete note">Delete</button>'
        : "";
      return '<article class="entry">' +
        '<div class="ed">' + esc(n.d || "") + "</div>" +
        "<h3>" + esc(n.t || "") + "</h3>" +
        paras(n.b || "") +
        admin +
        "</article>";
    }).join("");
    if (editing) {
      Array.prototype.forEach.call(wrap.querySelectorAll(".nb-del"), function (btn) {
        btn.addEventListener("click", function () {
          var i = parseInt(btn.getAttribute("data-i"), 10);
          if (confirm("Delete this note?")) {
            notes.splice(i, 1); save(notes); render();
          }
        });
      });
    }
  }

  function setEditing(on) {
    var wrap = document.getElementById("nb-entries");
    var composer = document.getElementById("nb-composer");
    var gate = document.getElementById("nb-gate");
    var lockBtn = document.getElementById("nb-lock");
    wrap.setAttribute("data-editing", on ? "1" : "0");
    if (composer) composer.style.display = on ? "block" : "none";
    if (gate) gate.style.display = on ? "none" : "block";
    if (lockBtn) lockBtn.style.display = on ? "inline-flex" : "none";
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();

    var unlock = document.getElementById("nb-unlock");
    var passInput = document.getElementById("nb-pass");
    var gateMsg = document.getElementById("nb-gate-msg");
    if (unlock) {
      var tryUnlock = function () {
        if (passInput.value === PASS) {
          sessionStorage.setItem("cw_nb_unlocked", "1");
          setEditing(true);
          passInput.value = "";
          gateMsg.textContent = "";
        } else {
          gateMsg.textContent = "Wrong passcode.";
        }
      };
      unlock.addEventListener("click", tryUnlock);
      passInput.addEventListener("keydown", function (e) { if (e.key === "Enter") tryUnlock(); });
    }

    // stay unlocked within the session
    if (sessionStorage.getItem("cw_nb_unlocked") === "1") setEditing(true);

    var lockBtn = document.getElementById("nb-lock");
    if (lockBtn) lockBtn.addEventListener("click", function () {
      sessionStorage.removeItem("cw_nb_unlocked");
      setEditing(false);
    });

    var addBtn = document.getElementById("nb-add");
    if (addBtn) addBtn.addEventListener("click", function () {
      var d = document.getElementById("nb-date").value.trim() || "Note";
      var t = document.getElementById("nb-title").value.trim();
      var b = document.getElementById("nb-body").value.trim();
      if (!t && !b) { alert("Add a title or some text first."); return; }
      notes.unshift({ d: d, t: t, b: b });
      save(notes);
      document.getElementById("nb-date").value = "";
      document.getElementById("nb-title").value = "";
      document.getElementById("nb-body").value = "";
      render();
    });

    // export current notes as HTML entries to paste into build.py for permanence
    var exportBtn = document.getElementById("nb-export");
    if (exportBtn) exportBtn.addEventListener("click", function () {
      var html = notes.map(function (n) {
        return '      <article class="entry">\n' +
          '        <div class="ed">' + esc(n.d) + "</div>\n" +
          "        <h3>" + esc(n.t) + "</h3>\n" +
          "        " + paras(n.b) + "\n" +
          "      </article>";
      }).join("\n");
      var ta = document.getElementById("nb-export-out");
      ta.style.display = "block";
      ta.value = html;
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      exportBtn.textContent = "Copied \u2713";
      setTimeout(function () { exportBtn.textContent = "Export notes (HTML)"; }, 1800);
    });
  });
})();
