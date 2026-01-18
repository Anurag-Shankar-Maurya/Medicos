from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.models import F
from django.utils import timezone
from apps.medicines.models import Medicine, Notification

class Command(BaseCommand):
    help = 'Check for low stock and other conditions to generate notifications'

    def handle(self, *args, **options):
        self.stdout.write('Checking for notifications...')

        User = get_user_model()

        # Get all active users who should receive notifications (admin, manager, pharmacist)
        notification_users = User.objects.filter(
            role__in=['admin', 'manager', 'pharmacist'],
            is_active=True
        )

        if not notification_users.exists():
            self.stdout.write(self.style.WARNING('No users found to receive notifications'))
            return

        notifications_created = 0

        # 1. Check for low stock alerts
        low_stock_medicines = Medicine.objects.filter(
            quantity_in_stock__lte=F('reorder_level'),
            quantity_in_stock__gt=0,
            is_active=True
        )

        for medicine in low_stock_medicines:
            # Check if notification already exists for this medicine in the last 24 hours
            existing_notification = Notification.objects.filter(
                medicine=medicine,
                notification_type='low_stock',
                created_at__gte=timezone.now() - timezone.timedelta(hours=24)
            ).exists()

            if not existing_notification:
                for user in notification_users:
                    Notification.objects.create(
                        title="Low Stock Alert",
                        message=f"{medicine.name} ({medicine.strength}) is running low. Current stock: {medicine.quantity_in_stock}, Reorder level: {medicine.reorder_level}",
                        notification_type='low_stock',
                        priority='medium',
                        medicine=medicine,
                        user=user
                    )
                    notifications_created += 1

        # 2. Check for out of stock alerts
        out_of_stock_medicines = Medicine.objects.filter(
            quantity_in_stock__lte=0,
            is_active=True
        )

        for medicine in out_of_stock_medicines:
            # Check if notification already exists for this medicine in the last 24 hours
            existing_notification = Notification.objects.filter(
                medicine=medicine,
                notification_type='out_of_stock',
                created_at__gte=timezone.now() - timezone.timedelta(hours=24)
            ).exists()

            if not existing_notification:
                for user in notification_users:
                    Notification.objects.create(
                        title="Out of Stock Alert",
                        message=f"{medicine.name} ({medicine.strength}) is out of stock. Immediate reorder required.",
                        notification_type='out_of_stock',
                        priority='high',
                        medicine=medicine,
                        user=user
                    )
                    notifications_created += 1

        # 3. Check for overstocked items (optional)
        overstocked_medicines = Medicine.objects.filter(
            quantity_in_stock__gt=F('max_stock_level'),
            is_active=True
        )

        for medicine in overstocked_medicines:
            # Check if notification already exists for this medicine in the last 7 days
            existing_notification = Notification.objects.filter(
                medicine=medicine,
                notification_type='system',
                title__icontains='overstock',
                created_at__gte=timezone.now() - timezone.timedelta(days=7)
            ).exists()

            if not existing_notification:
                for user in notification_users.filter(role__in=['admin', 'manager']):
                    Notification.objects.create(
                        title="Overstock Alert",
                        message=f"{medicine.name} ({medicine.strength}) has excess stock. Current: {medicine.quantity_in_stock}, Max level: {medicine.max_stock_level}",
                        notification_type='system',
                        priority='low',
                        medicine=medicine,
                        user=user
                    )
                    notifications_created += 1

        if notifications_created > 0:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created {notifications_created} notifications')
            )
        else:
            self.stdout.write('No new notifications needed')
