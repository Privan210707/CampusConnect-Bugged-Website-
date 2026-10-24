from django.db import IntegrityError
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Announcement, Club, Event, EventRegistration, Feedback


def make_event(**kwargs):
    defaults = {
        "title": "Hack Night",
        "description": "Build session in the lab.",
        "starts_at": timezone.now(),
        "venue": "Innovation Lab",
    }
    defaults.update(kwargs)
    return Event.objects.create(**defaults)


class ModelTests(TestCase):
    def test_registration_unique_event_and_email(self):
        event = make_event()
        EventRegistration.objects.create(
            event=event,
            student_name="Ada Lovelace",
            email="ada@example.com",
        )
        with self.assertRaises(IntegrityError):
            EventRegistration.objects.create(
                event=event,
                student_name="Ada Two",
                email="ada@example.com",
            )

    def test_registration_email_is_stored_lowercase(self):
        event = make_event()
        registration = EventRegistration.objects.create(
            event=event,
            student_name="Ada Lovelace",
            email="Ada@Example.COM",
        )
        self.assertEqual(registration.email, "ada@example.com")


class AnnouncementAPITests(APITestCase):
    def test_list_announcements(self):
        Announcement.objects.create(
            title="Library hours",
            description="Open until 11 PM during midterms.",
            published_at=timezone.now(),
        )
        response = self.client.get(reverse("announcement-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Library hours")

    def test_api_does_not_offer_browsable_html_renderer(self):
        response = self.client.get(
            reverse("announcement-list"),
            HTTP_ACCEPT="text/html",
        )
        self.assertEqual(response.status_code, 406)


class ClubAPITests(APITestCase):
    def setUp(self):
        Club.objects.create(
            name="Robotics Society",
            category=Club.Category.TECHNICAL,
            description="Build and code campus robots.",
        )
        Club.objects.create(
            name="Drama Circle",
            category=Club.Category.CULTURAL,
            description="Stage plays and street theatre.",
        )

    def test_list_clubs(self):
        response = self.client.get(reverse("club-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_filter_clubs_by_category(self):
        response = self.client.get(reverse("club-list"), {"category": "Technical"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Robotics Society")

    def test_search_clubs_by_name(self):
        response = self.client.get(reverse("club-list"), {"search": "drama"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Drama Circle")


class EventAPITests(APITestCase):
    def test_list_events(self):
        make_event()
        response = self.client.get(reverse("event-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["venue"], "Innovation Lab")


class RegistrationAPITests(APITestCase):
    def setUp(self):
        self.event = make_event()
        self.url = reverse("registration-create")

    def test_create_registration(self):
        response = self.client.post(
            self.url,
            {
                "event": self.event.id,
                "student_name": "Ada Lovelace",
                "email": "ada@example.com",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(EventRegistration.objects.count(), 1)

    def test_reject_invalid_email(self):
        response = self.client.post(
            self.url,
            {
                "event": self.event.id,
                "student_name": "Ada Lovelace",
                "email": "not-an-email",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_reject_duplicate_registration(self):
        payload = {
            "event": self.event.id,
            "student_name": "Ada Lovelace",
            "email": "ada@example.com",
        }
        first = self.client.post(self.url, payload, format="json")
        second = self.client.post(self.url, payload, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 400)
        self.assertIn("email", second.data)
        self.assertEqual(EventRegistration.objects.count(), 1)

    def test_reject_missing_name(self):
        response = self.client.post(
            self.url,
            {"event": self.event.id, "student_name": "  ", "email": "ada@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("student_name", response.data)


class FeedbackAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("feedback-create")

    def test_create_feedback(self):
        response = self.client.post(
            self.url,
            {
                "name": "Ada Lovelace",
                "email": "ada@example.com",
                "subject": "Library hours",
                "message": "Please keep the late hours after midterms too.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Feedback.objects.count(), 1)

    def test_reject_invalid_feedback_email(self):
        response = self.client.post(
            self.url,
            {
                "name": "Ada Lovelace",
                "email": "bad-email",
                "subject": "Library hours",
                "message": "Please keep the late hours after midterms too.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_reject_short_message(self):
        response = self.client.post(
            self.url,
            {
                "name": "Ada Lovelace",
                "email": "ada@example.com",
                "subject": "Hello",
                "message": "Too short",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("message", response.data)
