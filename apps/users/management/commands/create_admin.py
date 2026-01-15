from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class Command(BaseCommand):
    help = 'Create an admin user with predefined credentials'

    def handle(self, *args, **options):
        username = 'anurag'
        password = 'BabuBhaiya3233..'
        email = 'anuragmaurya3233@gmail.com'

        try:
            # Check if user already exists
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': 'Anurag',
                    'last_name': 'Maurya',
                    'role': 'admin',
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True,
                }
            )

            if created:
                # Set password for new user
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created admin user: {username}'
                    )
                )
            else:
                # Update existing user with admin permissions
                user.email = email
                user.role = 'admin'
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully updated existing user {username} to admin'
                    )
                )

        except ValidationError as e:
            self.stdout.write(
                self.style.ERROR(f'Validation error: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating admin user: {e}')
            )
