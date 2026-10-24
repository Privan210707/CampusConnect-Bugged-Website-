from django.db import IntegrityError
from rest_framework import serializers

from .models import Announcement, Club, Event, EventRegistration, Feedback


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["id", "title", "description", "published_at", "created_at"]
        read_only_fields = ["id", "created_at"]


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = ["id", "name", "category", "description", "image_url"]
        read_only_fields = ["id"]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "title", "description", "starts_at", "venue"]
        read_only_fields = ["id"]


class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = ["id", "event", "student_name", "email", "registered_at"]
        read_only_fields = ["id", "registered_at"]
        # UniqueConstraint is checked in validate() so the error maps to `email`.
        validators = []

    def validate_email(self, value):
        return value.strip().lower()

    def validate_student_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError("Student name is required.")
        return name

    def validate(self, attrs):
        event = attrs.get("event")
        email = attrs.get("email")
        if event and email and EventRegistration.objects.filter(event=event, email=email).exists():
            raise serializers.ValidationError(
                {
                    "email": "This email is already registered for this event.",
                }
            )
        return attrs

    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {"email": "This email is already registered for this event."}
            ) from exc


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "name", "email", "subject", "message", "submitted_at"]
        read_only_fields = ["id", "submitted_at"]

    def validate_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError("Name is required.")
        return name

    def validate_subject(self, value):
        subject = value.strip()
        if not subject:
            raise serializers.ValidationError("Subject is required.")
        return subject

    def validate_message(self, value):
        message = value.strip()
        if not message:
            raise serializers.ValidationError("Message is required.")
        if len(message) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        return message

    def validate_email(self, value):
        return value.strip().lower()
