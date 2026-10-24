import os
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "campusconnect.settings")
django.setup()

from college.models import Announcement, Club, Event

# ---------------- ANNOUNCEMENTS ----------------

announcements = [
    {
        "title": "Welcome to CampusConnect",
        "description": "Explore college clubs, discover events, and stay updated with campus announcements.",
        "days_ago": 0,
    },
    {
        "title": "CCC Society Bug Hunting Event",
        "description": "Join the CCC Society event to test the college website, identify bugs, and improve your debugging skills.",
        "days_ago": 1,
    },
    {
        "title": "Club Recruitment Drive",
        "description": "Students can explore different clubs and societies and participate in upcoming recruitment activities.",
        "days_ago": 2,
    },
    {
        "title": "Upcoming Technical Workshops",
        "description": "Keep an eye on the Events page for technical workshops, coding sessions, and learning opportunities.",
        "days_ago": 3,
    },
]

for item in announcements:
    Announcement.objects.get_or_create(
        title=item["title"],
        defaults={
            "description": item["description"],
            "published_at": timezone.now() - timedelta(days=item["days_ago"]),
        },
    )

# ---------------- CLUBS ----------------

clubs = [
    {
        "name": "CCC Society",
        "category": "Technical",
        "description": "A community for coding, collaboration, technical learning, and software development.",
    },
    {
        "name": "Coding Club",
        "category": "Technical",
        "description": "Practice programming, solve coding problems, and participate in coding contests.",
    },
    {
        "name": "Robotics Club",
        "category": "Technical",
        "description": "Explore robotics, electronics, automation, and hands-on engineering projects.",
    },
    {
        "name": "Literary Club",
        "category": "Academic",
        "description": "Develop writing, reading, public speaking, and communication skills.",
    },
    {
        "name": "Cultural Club",
        "category": "Cultural",
        "description": "Celebrate cultural activities, music, dance, and college festivals.",
    },
    {
        "name": "Sports Club",
        "category": "Sports",
        "description": "Participate in sports activities, competitions, and fitness events.",
    },
    {
        "name": "Photography Club",
        "category": "Cultural",
        "description": "Learn photography, visual storytelling, and creative editing.",
    },
    {
        "name": "Social Service Club",
        "category": "Community",
        "description": "Take part in volunteering, awareness campaigns, and community service.",
    },
]

for item in clubs:
    Club.objects.get_or_create(
        name=item["name"],
        defaults={
            "category": item["category"],
            "description": item["description"],
            "image_url": "",
        },
    )

# ---------------- EVENTS ----------------

now = timezone.now()

events = [
    {
        "title": "Campus Coding Challenge",
        "description": "Test your programming skills with coding problems and challenges.",
        "days_ahead": 3,
        "venue": "Computer Lab",
    },
    {
        "title": "Web Development Workshop",
        "description": "Learn the fundamentals of HTML, CSS, JavaScript, and web development.",
        "days_ahead": 7,
        "venue": "Seminar Hall",
    },
    {
        "title": "CCC Society Bug Hunt",
        "description": "Explore a website, report reproducible bugs, and practise software testing.",
        "days_ahead": 10,
        "venue": "Computer Lab",
    },
    {
        "title": "Robotics Demonstration",
        "description": "Discover robotics projects, automation, and practical engineering applications.",
        "days_ahead": 14,
        "venue": "Innovation Lab",
    },
    {
        "title": "Cultural Fest",
        "description": "Enjoy performances, creative activities, and cultural celebrations.",
        "days_ahead": 20,
        "venue": "College Auditorium",
    },
]

for item in events:
    Event.objects.get_or_create(
        title=item["title"],
        defaults={
            "description": item["description"],
            "starts_at": now + timedelta(days=item["days_ahead"]),
            "venue": item["venue"],
        },
    )

print("\nSample data added successfully!")
print("Announcements:", Announcement.objects.count())
print("Clubs:", Club.objects.count())
print("Events:", Event.objects.count())