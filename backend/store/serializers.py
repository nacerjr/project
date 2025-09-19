from rest_framework import serializers
from .models import Account, PlayerCard, WhatsAppLink

class PlayerCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerCard
        fields = ['id', 'image', 'category']

class AccountSerializer(serializers.ModelSerializer):
    player_cards = PlayerCardSerializer(many=True, read_only=True)
    effective_price = serializers.ReadOnlyField()
    has_discount = serializers.ReadOnlyField()
    is_recently_created = serializers.ReadOnlyField()
        
    class Meta:
        model = Account
        fields = ['id', 'name', 'price', 'promo_price', 'rating', 'image_normal', 
                 'image_hover', 'image_detail', 'description', 'player_cards', 
                 'is_active', 'is_new', 'is_promo', 'effective_price', 
                 'has_discount', 'is_recently_created', 'created_at']

class WhatsAppLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppLink
        fields = ['id', 'link', 'created_at', 'is_active']