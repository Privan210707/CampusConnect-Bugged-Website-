from django.db import models


class Announcement(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    published_at = models.DateTimeField(
        help_text="When this announcement should appear as published."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title


class Club(models.Model):
    class Category(models.TextChoices):
        ACADEMIC = "Academic", "Academic"
        CULTURAL = "Cultural", "Cultural"
        SPORTS = "Sports", "Sports"
        TECHNICAL = "Technical", "Technical"
        COMMUNITY = "Community", "Community"

    name = models.CharField(max_length=120)
    category = models.CharField(max_length=32, choices=Category.choices)
    description = models.TextField()
    image_url = models.URLField(blank=True, default="")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    starts_at = models.DateTimeField()
    venue = models.CharField(max_length=200)

    class Meta:
        ordering = ["starts_at"]

    def __str__(self):
        return self.title


class EventRegistration(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="registrations",
    )
    student_name = models.CharField(max_length=120)
    email = models.EmailField()
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["event", "email"],
                name="unique_registration_event_email",
            )
        ]
        ordering = ["-registered_at"]

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} -> {self.event_id}"


class Feedback(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.subject} ({self.email})"
