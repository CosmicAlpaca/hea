from rest_framework import serializers

class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField()

class ChatResponseSerializer(serializers.Serializer):
    reply = serializers.CharField()