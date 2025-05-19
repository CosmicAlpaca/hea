from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import requests
import os


class IsDoctorUser(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user and hasattr(request.user, 'token') and request.user.token.get('role') == 'doctor'


class DoctorScheduleView(APIView):
    permission_classes = [IsDoctorUser]

    def get(self, request):
        doctor_id = request.user.id

        auth_token = request.META.get('HTTP_AUTHORIZATION')
        headers = {'Authorization': auth_token}
        patient_service_url = os.environ.get('PATIENT_SERVICE_URL', 'http://patient_service:8002')

        try:
            response = requests.get(
                f'{patient_service_url}/api/patient/appointments/?doctor_id={doctor_id}',
                headers=headers,
                timeout=5
            )
            response.raise_for_status()
            appointments_data = response.json()
        except requests.RequestException as e:
            appointments_data = {'error': str(e), 'detail': 'Could not fetch appointments from patient service.'}
            return Response(appointments_data, status=503)  # Service Unavailable

        return Response({
            "message": f"Schedule for Doctor ID: {doctor_id}",
            "appointments": appointments_data.get('results', appointments_data)
            # Handle pagination from patient service
        })