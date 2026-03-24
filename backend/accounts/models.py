from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Roles(models.TextChoices):
        JUDGE = 'JUDGE', 'Judge'
        CLERK = 'CLERK', 'Clerk'
        REGISTRAR = 'REGISTRAR', 'Registrar'
        ADMIN = 'ADMIN', 'Admin'

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CLERK)

    def __str__(self):
        return f"{self.username} ({self.role})"
