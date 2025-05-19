from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient_id', 'doctor_id', 'appointment_date', 'status', 'created_at')
    list_filter = ('status', 'appointment_date')
    search_fields = ('patient_id', 'doctor_id', 'reason')