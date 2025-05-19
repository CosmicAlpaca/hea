from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random
from .serializers import ChatMessageSerializer, ChatResponseSerializer


class ChatbotView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ChatMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_message = serializer.validated_data.get('message', '').lower()
        response_message = "I'm sorry, I don't understand that yet. Please try asking about appointments, clinic hours, or location."

        greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
        farewells = ["bye", "goodbye", "see you", "take care"]

        if any(greeting in user_message for greeting in greetings):
            response_message = random.choice(
                ["Hello! How can I help you today?", "Hi there! What can I do for you?", "Hey! How are you?"])
        elif "how are you" in user_message:
            response_message = "I'm an AI, so I don't have feelings, but I'm functioning optimally! How can I assist you?"
        elif "appointment" in user_message:
            if "book" in user_message or "make" in user_message or "schedule" in user_message:
                response_message = "To book an appointment, please log in to your patient dashboard or call our clinic directly. The dashboard allows you to see available slots."
            elif "cancel" in user_message or "reschedule" in user_message:
                response_message = "You can cancel or reschedule an appointment through your patient dashboard. If you need assistance, please contact the clinic."
            else:
                response_message = "I can provide general information about appointments. Are you looking to book, cancel, or do you have another question about appointments?"
        elif "hour" in user_message or "open" in user_message or "time" in user_message:
            response_message = "Our clinic is typically open Monday to Friday, from 9 AM to 5 PM. It's best to check for specific holidays or special hours."
        elif "location" in user_message or "address" in user_message or "where" in user_message:
            response_message = "Our main clinic is located at 123 Health St, Wellness City. Do you need directions or information about parking?"
        elif "service" in user_message or "offer" in user_message or "what can you do" in user_message:
            response_message = "We offer a range of medical services including general check-ups, specialist consultations, vaccinations, and various lab tests. For specific details, please check our website or consult with our staff."
        elif "doctor" in user_message or "physician" in user_message:
            response_message = "We have a team of qualified doctors specializing in various fields. You can find more information about our doctors on our website or by contacting the clinic."
        elif "insurance" in user_message:
            response_message = "We accept a variety of insurance plans. Please contact our administrative staff or check our website for a list of accepted providers."
        elif "payment" in user_message or "bill" in user_message or "cost" in user_message:
            response_message = "For questions regarding payments, bills, or the cost of services, please contact our billing department."
        elif any(farewell in user_message for farewell in farewells):
            response_message = random.choice(
                ["Goodbye! Take care.", "See you later! Stay healthy.", "Have a great day!"])
        elif "help" in user_message or "support" in user_message:
            response_message = "I can provide information about our services, opening hours, appointments, and location. If you need medical advice, please consult a doctor. For technical support with the portal, please contact our support line."

        response_serializer = ChatResponseSerializer(data={'reply': response_message})
        response_serializer.is_valid(raise_exception=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)