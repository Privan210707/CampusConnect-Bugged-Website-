from django.db.models import Q
from rest_framework import generics

from .models import Announcement, Club, Event, EventRegistration, Feedback
from .serializers import (
    AnnouncementSerializer,
    ClubSerializer,
    EventRegistrationSerializer,
    EventSerializer,
    FeedbackSerializer,
)


class AnnouncementListView(generics.ListAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer


class ClubListView(generics.ListAPIView):
    serializer_class = ClubSerializer

    def get_queryset(self):
        queryset = Club.objects.all()
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search") or self.request.query_params.get("name")

        if category:
            queryset = queryset.filter(category__iexact=category.strip())
        if search:
            term = search.strip()
            queryset = queryset.filter(
                Q(name__icontains=term) | Q(category__icontains=term) | Q(description__icontains=term)
            )
        return queryset


class EventListView(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class RegistrationCreateView(generics.CreateAPIView):
    queryset = EventRegistration.objects.all()
    serializer_class = EventRegistrationSerializer


class FeedbackCreateView(generics.CreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
