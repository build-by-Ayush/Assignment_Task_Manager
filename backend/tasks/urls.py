from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterUser, TaskList, TaskDetail, SubTaskListCreate, SubTaskDetail
from .views import FocusSessionListCreate
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path('auth/register/', RegisterUser.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Task endpoints
    path('tasks/', TaskList.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetail.as_view(), name='task-detail'),

    # SubTask endpoints
    path('subtasks/', SubTaskListCreate.as_view(), name='subtask-list-create'),
    path('subtasks/<int:pk>/', SubTaskDetail.as_view(), name='subtask-detail'),

    #Focus Pagge
    path('focus/', FocusSessionListCreate.as_view(), name='focus-list-create'),
]

