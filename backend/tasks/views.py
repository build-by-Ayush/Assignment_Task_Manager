from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import Task, SubTask
from .serializers import RegisterSerializer, TaskSerializer, UserSerializer, SubTaskSerializer , FocusSessionSerializer
from .models import Task, SubTask, FocusSession
from rest_framework import viewsets


# User registration API
class RegisterUser(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


# JWT login and token refresh views from simplejwt
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = RegisterSerializer


# Task APIs for authenticated users
class TaskList(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)


# SubTask APIs for authenticated users
class SubTaskListCreate(generics.ListCreateAPIView):
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SubTask.objects.filter(task__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()


class SubTaskDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SubTask.objects.filter(task__user=self.request.user)


class FocusSessionListCreate(generics.ListCreateAPIView):
    serializer_class = FocusSessionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

