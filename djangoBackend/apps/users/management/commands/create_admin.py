from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample users with different roles'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Create all sample users (admin, pharmacist, cashier, manager)',
        )

    def handle(self, *args, **options):
        users_data = [
            {
                'username': 'anurag',
                'password': 'BabuBhaiya3233..',
                'email': 'anuragmaurya3233@gmail.com',
                'first_name': 'Anurag',
                'last_name': 'Maurya',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            },
            {
                'username': 'pharmacist',
                'password': 'pharm123',
                'email': 'pharmacist@medicos.com',
                'first_name': 'John',
                'last_name': 'Pharmacist',
                'role': 'pharmacist',
                'is_staff': False,
                'is_superuser': False,
            },
            {
                'username': 'cashier',
                'password': 'cash123',
                'email': 'cashier@medicos.com',
                'first_name': 'Jane',
                'last_name': 'Cashier',
                'role': 'cashier',
                'is_staff': False,
                'is_superuser': False,
            },
            {
                'username': 'manager',
                'password': 'mgr123',
                'email': 'manager@medicos.com',
                'first_name': 'Bob',
                'last_name': 'Manager',
                'role': 'manager',
                'is_staff': False,
                'is_superuser': False,
            },
        ]

        if not options['all']:
            # Default behavior - create only admin
            users_data = users_data[:1]

        for user_data in users_data:
            try:
                # Check if user already exists
                user, created = User.objects.get_or_create(
                    username=user_data['username'],
                    defaults={
                        'email': user_data['email'],
                        'first_name': user_data['first_name'],
                        'last_name': user_data['last_name'],
                        'role': user_data['role'],
                        'is_staff': user_data['is_staff'],
                        'is_superuser': user_data['is_superuser'],
                        'is_active': True,
                    }
                )

                if created:
                    # Set password for new user
                    user.set_password(user_data['password'])
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Successfully created {user_data["role"]} user: {user_data["username"]}'
                        )
                    )
                else:
                    # Update existing user
                    user.email = user_data['email']
                    user.first_name = user_data['first_name']
                    user.last_name = user_data['last_name']
                    user.role = user_data['role']
                    user.is_staff = user_data['is_staff']
                    user.is_superuser = user_data['is_superuser']
                    user.is_active = True
                    user.set_password(user_data['password'])
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Successfully updated existing user {user_data["username"]} to {user_data["role"]}'
                        )
                    )

            except ValidationError as e:
                self.stdout.write(
                    self.style.ERROR(f'Validation error for {user_data["username"]}: {e}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating user {user_data["username"]}: {e}')
                )
