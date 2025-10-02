from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone  # added for timestamps


class Task(models.Model):
    title = models.CharField(max_length=255) # Task title
    description = models.TextField(blank=True) # Optional description
    due_date = models.DateField(null=True, blank=True) # Optional deadline
    priority_choices = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')] # Priority choices
    priority = models.CharField(max_length=6, choices=priority_choices, default='low')
    completed = models.BooleanField(default=False) # Status flag
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks') # Owner of the task
    created_at = models.DateTimeField(auto_now_add=True) # Auto-set when created
    completed_at = models.DateTimeField(null=True, blank=True) # Auto-set when completed

    def save(self, *args, **kwargs):
        # Auto-set completed_at when marked completed
        if self.completed and self.completed_at is None:
            self.completed_at = timezone.now()
        elif not self.completed:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class SubTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-set completed_at when marked completed
        if self.completed and self.completed_at is None:
            self.completed_at = timezone.now()
        elif not self.completed:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class FocusSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
