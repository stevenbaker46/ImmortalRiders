// Members data (edit this file to add/remove users or events)
// NOTE: This is a static-site approach and is NOT secure like a real backend.

// Allowed members (email -> sha256(password) hash)
window.IR_MEMBERS = [
  {
    email: "stevenwbaker46@gmail.com",
    // sha256("IMMORTAL2026")
    pwHash: "a5b0d84cb7b1c89e6ed30cde9312950cf3e13ede26a6d57ce61a5f3e4a0c553f",
    role: "admin"
  },
];

// Events shown in the RSVP list
window.IR_EVENTS = [
  {
    id: "fri13-portdover-2026-02-22",
    title: "Friday the 13th Meet",
    date: "Feb 22, 2026",
    time: "10:00 AM",
    location: "1 St Andrew St, Port Dover, ON N0A 1N0"
  },
  {
    id: "church-hagersville-2026-02-22",
    title: "Church (Ride Meet)",
    date: "Feb 22, 2026",
    time: "11:00 AM",
    location: "700 Chiefswood Rd, Hagersville, ON N0A 1H0"
  }
];
