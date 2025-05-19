from django.db import models
import uuid

class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.IntegerField()
    doctor_id = models.IntegerField(null=True, blank=True)
    appointment_date = models.DateTimeField()
    reason = models.TextField()
    status_choices = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    status = models.CharField(max_length=10, choices=status_choices, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Appointment for patient {self.patient_id} on {self.appointment_date.strftime('%Y-%m-%d %H:%M')}"