# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from django.db import transaction
from .models import Account, PlayerCard, WhatsAppLink, AdminToken
from .serializers import AccountSerializer, WhatsAppLinkSerializer

class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
        
    def get_queryset(self):
        return Account.objects.filter(is_active=True)
    
    def create(self, request, *args, **kwargs):
        """Override create to handle player_cards"""
        with transaction.atomic():
            # Extraire les player_cards des données
            player_cards_data = request.data.pop('player_cards', [])
            
            # Créer le compte d'abord
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            account = serializer.save()
            
            # Créer les player_cards
            for card_data in player_cards_data:
                if card_data.get('image'):  # Seulement si l'image existe
                    PlayerCard.objects.create(
                        account=account,
                        image=card_data['image'],
                        category=card_data['category']
                    )
            
            # Retourner la réponse avec les player_cards incluses
            headers = self.get_success_headers(serializer.data)
            account_data = AccountSerializer(account).data
            return Response(account_data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """Override update to handle player_cards"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        with transaction.atomic():
            # Extraire les player_cards des données
            player_cards_data = request.data.pop('player_cards', [])
            
            # Mettre à jour le compte
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            account = serializer.save()
            
            # Supprimer les anciennes cartes et créer les nouvelles
            PlayerCard.objects.filter(account=account).delete()
            for card_data in player_cards_data:
                if card_data.get('image'):  # Seulement si l'image existe
                    PlayerCard.objects.create(
                        account=account,
                        image=card_data['image'],
                        category=card_data['category']
                    )
            
            # Retourner la réponse avec les player_cards incluses
            account_data = AccountSerializer(account).data
            return Response(account_data)

@api_view(['GET', 'POST'])
def whatsapp_link(request):
    if request.method == 'GET':
        try:
            link = WhatsAppLink.objects.filter(is_active=True).first()
            if link:
                serializer = WhatsAppLinkSerializer(link)
                return Response(serializer.data)
            return Response({'link': ''})
        except WhatsAppLink.DoesNotExist:
            return Response({'link': ''})
            
    elif request.method == 'POST':
        # Deactivate all existing links
        WhatsAppLink.objects.update(is_active=False)
                
        # Create new link
        serializer = WhatsAppLinkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def verify_admin(request, token):
    """Verify admin token"""
    if hasattr(settings, 'ADMIN_TOKEN') and token == settings.ADMIN_TOKEN:
        return Response({'valid': True})
        
    # Also check database tokens
    try:
        admin_token = AdminToken.objects.get(token=token, is_active=True)
        return Response({'valid': True})
    except AdminToken.DoesNotExist:
        return Response({'valid': False}, status=status.HTTP_401_UNAUTHORIZED)