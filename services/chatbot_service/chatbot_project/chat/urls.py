from django.urls import path
from .views import ChatbotView

urlpatterns = [
    path('interact/', ChatbotView.as_view(), name='chatbot_interact'),
]