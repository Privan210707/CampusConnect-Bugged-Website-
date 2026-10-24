from django.urls import path

from .views import (
    AnnouncementListView,
    ClubListView,
    EventListView,
    FeedbackCreateView,
    RegistrationCreateView,
)

urlpatterns = [
    path("announcements/", AnnouncementListView.as_view(), name="announcement-list"),
    path("clubs/", ClubListView.as_view(), name="club-list"),
    path("events/", EventListView.as_view(), name="event-list"),
    path("registrations/", RegistrationCreateView.as_view(), name="registration-create"),
    path("feedback/", FeedbackCreateView.as_view(), name="feedback-create"),
]
