from django.urls import path
from .views import RegisterView, UserDetailView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
]