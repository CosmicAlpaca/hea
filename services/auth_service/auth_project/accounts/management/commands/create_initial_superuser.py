import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError

class Command(BaseCommand):
    help = 'Creates a superuser if none exists based on environment variables, or if the specified superuser does not exist.'

    def handle(self, *args, **options):
        User = get_user_model()
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')

        if not username or not password:
            self.stdout.write(self.style.WARNING('DJANGO_SUPERUSER_USERNAME or DJANGO_SUPERUSER_PASSWORD environment variables not set. Skipping superuser creation.'))
            return

        try:
            if not User.objects.filter(username=username).exists():
                self.stdout.write(self.style.SUCCESS(f"Creating superuser '{username}'"))
                User.objects.create_superuser(username=username, email=email, password=password)
            else:
                self.stdout.write(self.style.NOTICE(f"Superuser '{username}' already exists."))
        except (OperationalError, ProgrammingError):
             self.stdout.write(self.style.WARNING('Database not ready for superuser creation. Run migrations first.'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error creating superuser: {e}'))