from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Appointment
from .serializers import AppointmentSerializer
from django.utils import timezone


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.patient_id == request.user.id or request.user.is_staff


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:  # Or a specific 'admin' role from JWT
            return Appointment.objects.all().order_by('-appointment_date')

        # This assumes user.id from JWT is the patient_id
        # In a real system, you'd check role from JWT claims
        # For now, if not staff, assume patient
        return Appointment.objects.filter(patient_id=user.id).order_by('-appointment_date')

    def perform_create(self, serializer):
        serializer.save(patient_id=self.request.user.id)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        requested_status = request.data.get('status')

        if requested_status:
            if request.user.id == instance.patient_id:  # Patient trying to update status
                if requested_status == 'CANCELLED' and instance.status in ['PENDING', 'CONFIRMED']:
                    pass  # Allowed
                else:
                    return Response({'detail': 'Patients can only cancel PENDING or CONFIRMED appointments.'},
                                    status=status.HTTP_400_BAD_REQUEST)
            elif request.user.is_staff:  # Admin/Doctor can change status more freely
                pass  # Allowed
            else:  # Non-owner, non-admin trying to change status
                return Response({'detail': 'You do not have permission to change the status.'},
                                status=status.HTTP_403_FORBIDDEN)

        # Prevent patient from modifying other fields if not PENDING
        if request.user.id == instance.patient_id and instance.status != 'PENDING':
            allowed_fields_for_patient_modify = ['status']
            for field in request.data.keys():
                if field not in allowed_fields_for_patient_modify:
                    return Response({'detail': f'Cannot modify field "{field}" for non-PENDING appointments.'},
                                    status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status == 'PENDING' or request.user.is_staff:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Cannot delete non-pending appointments unless you are an admin.'},
                        status=status.HTTP_400_BAD_REQUEST)