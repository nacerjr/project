from django.db import models
from django.utils import timezone
from datetime import timedelta

class Account(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # Nouveau champ pour le prix promotionnel
    promo_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rating = models.IntegerField(default=5, choices=[(i, i) for i in range(1, 6)])
    # Changement: TextField au lieu d'URLField pour accepter base64
    image_normal = models.TextField()  # Pour les images base64
    image_hover = models.TextField()   # Pour les images base64
    image_detail = models.TextField()  # Pour les images base64
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Nouveaux champs pour les étiquettes
    is_new = models.BooleanField(default=False, help_text="Marquer comme nouveau compte")
    is_promo = models.BooleanField(default=False, help_text="Marquer comme promotion")
    
    def __str__(self):
        return self.name
    
    @property
    def is_recently_created(self):
        """Vérifie si le compte a été créé dans les 7 derniers jours"""
        return self.created_at >= timezone.now() - timedelta(days=7)
    
    @property
    def effective_price(self):
        """Retourne le prix effectif (promo si disponible, sinon prix normal)"""
        return self.promo_price if self.is_promo and self.promo_price else self.price
    
    @property
    def has_discount(self):
        """Vérifie s'il y a une réduction"""
        return self.is_promo and self.promo_price and self.promo_price < self.price

    class Meta:
        ordering = ['-created_at']

class PlayerCard(models.Model):
    CATEGORY_CHOICES = [
        ('managers', 'Managers'),
        ('defenders', 'Defenders'),
        ('midfielders', 'Midfielders'),
        ('forwards', 'Forwards'),
    ]
    
    account = models.ForeignKey(Account, related_name='player_cards', on_delete=models.CASCADE)
    # Changement: TextField au lieu d'URLField pour accepter base64
    image = models.TextField()  # Pour les images base64
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.account.name} - {self.category}"

    class Meta:
        ordering = ['category', 'created_at']

class WhatsAppLink(models.Model):
    link = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"WhatsApp Link - {self.created_at}"

    class Meta:
        ordering = ['-created_at']

class AdminToken(models.Model):
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.token