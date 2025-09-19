from django.contrib import admin
from .models import Account, PlayerCard, WhatsAppLink, AdminToken

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']

@admin.register(PlayerCard)
class PlayerCardAdmin(admin.ModelAdmin):
    list_display = ['account', 'category', 'created_at']
    list_filter = ['category', 'created_at']

@admin.register(WhatsAppLink)
class WhatsAppLinkAdmin(admin.ModelAdmin):
    list_display = ['link', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']

@admin.register(AdminToken)
class AdminTokenAdmin(admin.ModelAdmin):
    list_display = ['token', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']