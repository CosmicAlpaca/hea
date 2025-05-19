from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('admin', 'Administrator'),
        ('pharmacist', 'Pharmacist'),
        ('lab_technician', 'Laboratory Technician'),
        ('insurance_provider', 'Insurance Provider'),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')

    def __str__(self):
        return self.username