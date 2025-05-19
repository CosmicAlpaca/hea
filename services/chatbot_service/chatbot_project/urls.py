from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/chatbot/', include('chatbot_project.chat.urls')), # CHANGE THIS
]