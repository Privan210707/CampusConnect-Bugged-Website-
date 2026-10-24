/**
 * Static college information shown on the public pages.
 * Dynamic announcements, clubs, and events come from the Django API.
 */
window.CampusConnect = window.CampusConnect || {};

CampusConnect.COLLEGE = {
  name: "Riverside College",
  tagline: "Learning that connects campus life.",
  intro:
    "Riverside College is a fictional undergraduate campus used for the CampusConnect portal. Students discover announcements, join clubs, and register for events in one place.",
  address: "14 Riverbank Avenue, Campus District, Pune 411001",
  phone: "+91 20 5550 2140",
  email: "hello@riversidecollege.example",
  hours: "Mon–Fri, 9:00 AM – 5:00 PM"
};

CampusConnect.CLUB_CATEGORIES = [
  "All",
  "Academic",
  "Cultural",
  "Sports",
  "Technical",
  "Community"
];
