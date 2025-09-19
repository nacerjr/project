from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, whatsapp_link, verify_admin

router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='account')

urlpatterns = [
    path('', include(router.urls)),
    path('whatsapp-link/', whatsapp_link, name='whatsapp-link'),
    path('verify-admin/<str:token>/', verify_admin, name='verify-admin'),
]