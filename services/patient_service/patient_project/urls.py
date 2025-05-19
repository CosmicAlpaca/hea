from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/patient/', include('patient_project.appointments.urls')), # CHANGE THIS
]