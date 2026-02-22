// Members portal app logic (static-site version)

const $ = (id) => document.getElementById(id);

const gate = $("gate");
const memberContent = $("memberContent");
const emailEl = $("email");
const pwEl = $("pw");
const errEl = $("err");
const whoEl = $("who");
const eventsEl = $("events");
const rsvpListEl = $("rsvpList");

const loginBtn = $("loginBtn");
const demoBtn = $("demoBtn");
const logoutBtn = $("logoutBtn");
const exportBtn = $("exportBtn");

const SESSION_KEY = "ir_members_session"; // { email, ts }
const RSVP_KEY = "ir_members_rsvps";      // { [eventId]: { [email]: "yes"|"no"|"maybe" } }

function showErr(msg) {
  errEl.style.display = "block";
  errEl.textContent = msg;
}
function clearErr() {
  errEl.style.display = "none";
  errEl.textContent = "";
}

function unlock(email) {
  gate.style.display = "none";
  memberContent.style.display = "grid";
  whoEl.textContent = email;
  renderEvents(email);
  renderRsvpList();
}

function lock() {
  sessionStorage.removeItem(SESSION_KEY);
  gate.style.display = "grid";
  memberContent.style.display = "none";
  emailEl.value = "";
  pwEl.value = "";
  clearErr();
}

async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function findMember(email) {
  const list = (window.IR_MEMBERS || []).map(m => ({...m, email: (m.email||"").toLowerCase()}));
  return list.find(m => m.email === (email||"").toLowerCase());
}

function getRsvps() {
  try { return JSON.parse(localStorage.getItem(RSVP_KEY) || "{}"); }
  catch { return {}; }
}
function setRsvps(obj) {
  localStorage.setItem(RSVP_KEY, JSON.stringify(obj));
}

function setMyRsvp(eventId, email, value) {
  const rsvps = getRsvps();
  rsvps[eventId] = rsvps[eventId] || {};
  rsvps[eventId][email.toLowerCase()] = value;
  setRsvps(rsvps);
  renderEvents(email);
  renderRsvpList();
}

function myRsvpFor(eventId, email) {
  const rsvps = getRsvps();
  return (rsvps[eventId] || {})[email.toLowerCase()] || "";
}

function renderEvents(email) {
  const events = window.IR_EVENTS || [];
  eventsEl.innerHTML = "";

  if (!events.length) {
    eventsEl.innerHTML = "<div class='list-item'><div class='meta'>No events yet. Add events in <b>members-data.js</b>.</div></div>";
    return;
  }

  for (const ev of events) {
    const mine = myRsvpFor(ev.id, email);

    const item = document.createElement("div");
    item.className = "list-item rsvp-card";

    item.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-weight:800;font-size:15px;color:var(--text)">${ev.title}</div>
          <div class="meta">${ev.date} • ${ev.time}</div>
          <div class="meta">${ev.location}</div>
        </div>
        <div class="tag">Your RSVP: <b>${mine ? mine.toUpperCase() : "—"}</b></div>
      </div>
      <div class="rsvp-actions">
        <button class="btn primary small" data-v="yes">Yes</button>
        <button class="btn tertiary small" data-v="maybe">Maybe</button>
        <button class="btn tertiary small" data-v="no">No</button>
      </div>
    `;

    item.querySelectorAll("button[data-v]").forEach(btn => {
      const v = btn.getAttribute("data-v");
      btn.addEventListener("click", () => setMyRsvp(ev.id, email, v));
      // style selected
      if (v === mine) {
        btn.classList.remove("tertiary"); btn.classList.add("primary");
      }
    });

    eventsEl.appendChild(item);
  }
}

function renderRsvpList() {
  const events = window.IR_EVENTS || [];
  const rsvps = getRsvps();
  rsvpListEl.innerHTML = "";

  if (!events.length) return;

  for (const ev of events) {
    const map = rsvps[ev.id] || {};
    const entries = Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0]));

    const box = document.createElement("div");
    box.className = "list-item";

    const lines = entries.length
      ? entries.map(([email, v]) => `<div class="meta"><b style="color:var(--text)">${email}</b> — ${String(v).toUpperCase()}</div>`).join("")
      : `<div class="meta">No RSVPs yet.</div>`;

    box.innerHTML = `
      <div style="font-weight:800;font-size:15px;color:var(--text)">${ev.title}</div>
      <div class="meta">${ev.date} • ${ev.time}</div>
      <div class="divider"></div>
      ${lines}
    `;
    rsvpListEl.appendChild(box);
  }
}

async function login() {
  clearErr();
  const email = (emailEl.value || "").trim().toLowerCase();
  const pw = pwEl.value || "";

  if (!email || !pw) return showErr("Enter email and password.");

  const member = findMember(email);
  if (!member) return showErr("That email isn’t on the member list yet.");

  const hash = await sha256Hex(pw);
  if (hash !== member.pwHash) return showErr("Wrong password.");

  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now() }));
  unlock(email);
}

function tryAutoLogin() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s?.email) unlock(s.email);
  } catch {}
}

function useSavedLogin() {
  // Just pre-fills the last email, if any.
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return showErr("No saved session found. Login normally first.");
  try {
    const s = JSON.parse(raw);
    emailEl.value = s.email || "";
  } catch {
    showErr("No saved session found. Login normally first.");
  }
}

function exportRsvps() {
  const payload = {
    exportedAt: new Date().toISOString(),
    events: window.IR_EVENTS || [],
    rsvps: getRsvps()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "immortal-riders-rsvps.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

loginBtn.addEventListener("click", login);
demoBtn.addEventListener("click", useSavedLogin);
logoutBtn.addEventListener("click", lock);
exportBtn.addEventListener("click", exportRsvps);

pwEl.addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });
emailEl.addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });

tryAutoLogin();
