from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/doctor/', include('doctor_project.schedules.urls')), # CHANGE THIS
]