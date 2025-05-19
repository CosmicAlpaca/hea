from django.urls import path
from .views import DoctorScheduleView

urlpatterns = [
    path('schedule/', DoctorScheduleView.as_view(), name='doctor_schedule'),
]