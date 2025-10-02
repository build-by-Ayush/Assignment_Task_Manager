from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task, SubTask, FocusSession


# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        # Create user using Django's built-in method (handles password hashing)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


# SubTask Serializer
class SubTaskSerializer(serializers.ModelSerializer):
    completed_at = serializers.DateTimeField(read_only=True)  #now read-only

    class Meta:
        model = SubTask
        fields = ['id', 'title', 'completed', 'task', 'completed_at']

    def create(self, validated_data):
        subtask = super().create(validated_data)
        return subtask

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        return instance


# Task Serializer
class TaskSerializer(serializers.ModelSerializer):
    # Nested subtasks included (read-only)
    subtasks = SubTaskSerializer(many=True, read_only=True)
    completed_at = serializers.DateTimeField(read_only=True)   # Auto-managed

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'due_date',
            'priority', 'completed', 'created_at',
            'subtasks', 'completed_at'
        ]

    def create(self, validated_data):
        task = super().create(validated_data)
        return task

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        return instance


# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# Focus Session Serializer
class FocusSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusSession
        fields = ['id', 'timestamp']
