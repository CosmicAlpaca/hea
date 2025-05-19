from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    patient_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patient_id', 'doctor_id', 'appointment_date', 'reason', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'patient_id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['patient_id'] = self.context['request'].user.id
        return super().create(validated_data)

    def validate_appointment_date(self, value):
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value