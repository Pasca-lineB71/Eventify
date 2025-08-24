from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from .managers import UserManager

class User(AbstractUser):
    ROLE_CHOICES = (
        ('participant', 'Participant'),
        ('organisateur', 'Organisateur'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='participant')

    # Personnalisation pour utiliser email comme identifiant unique
    username = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # demander username pour créer un superuser

    # Correction du conflit avec groups et permissions
    groups = models.ManyToManyField(
        Group,
        related_name='core_users',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='core_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    objects = UserManager()  # ton manager personnalisé

    def __str__(self):
        return self.email
