from django.contrib import admin

from .models import Announcement, Club, Event, EventRegistration, Feedback


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "published_at", "created_at")
    search_fields = ("title", "description")
    list_filter = ("published_at",)


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ("name", "category")
    search_fields = ("name", "description")
    list_filter = ("category",)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "starts_at", "venue")
    search_fields = ("title", "venue", "description")
    list_filter = ("starts_at",)


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ("student_name", "email", "event", "registered_at")
    search_fields = ("student_name", "email")
    list_filter = ("event",)


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "submitted_at")
    search_fields = ("name", "email", "subject", "message")
