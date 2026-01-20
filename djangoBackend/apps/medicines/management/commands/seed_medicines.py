from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models.deletion import ProtectedError
from decimal import Decimal
from apps.medicines.models import Medicine
import random


class Command(BaseCommand):
    help = 'Seed the database with sample medicines'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing medicines before seeding (will skip if medicines are referenced in sales)',
        )
        parser.add_argument(
            '--count',
            type=int,
            default=50,
            help='Number of medicines to create (default: 50)',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing medicines...')
            try:
                Medicine.objects.all().delete()
                self.stdout.write(self.style.SUCCESS('Existing medicines cleared.'))
            except ProtectedError:
                self.stdout.write(
                    self.style.WARNING('Cannot clear medicines - some are referenced in sales transactions. Skipping clear operation.')
                )

        count = options['count']
        self.stdout.write(f'Creating {count} sample medicines...')

        # Sample medicine data
        medicine_data = [
            {
                'name': 'Paracetamol',
                'generic_name': 'Acetaminophen',
                'medicine_type': 'tablet',
                'manufacturer': 'PharmaCorp',
                'supplier_name': 'MediSupply Ltd',
                'composition': 'Paracetamol 500mg',
                'strength': '500mg',
                'pack_size': '10 tablets',
                'purchase_price': Decimal('2.50'),
                'mrp': Decimal('5.00'),
                'selling_price': Decimal('4.50'),
                'gst_percentage': Decimal('12.00'),
                'hsn_code': '30049011',
                'quantity_in_stock': random.randint(20, 200),
                'reorder_level': 10,
                'max_stock_level': 100,
                'rack_number': 'A1',
                'shelf_number': 'S1',
                'requires_prescription': False,
                'usage_instructions': 'Take 1-2 tablets every 4-6 hours as needed for pain or fever. Do not exceed 8 tablets in 24 hours.',
                'side_effects': 'Rare: skin rash, nausea, vomiting. Seek medical attention if symptoms persist.',
            },
            {
                'name': 'Ibuprofen',
                'generic_name': 'Ibuprofen',
                'medicine_type': 'tablet',
                'manufacturer': 'PainRelief Pharma',
                'supplier_name': 'HealthSupplies Inc',
                'composition': 'Ibuprofen 400mg',
                'strength': '400mg',
                'pack_size': '15 tablets',
                'purchase_price': Decimal('3.00'),
                'mrp': Decimal('8.00'),
                'selling_price': Decimal('7.00'),
                'gst_percentage': Decimal('12.00'),
                'hsn_code': '30049011',
                'quantity_in_stock': random.randint(15, 150),
                'reorder_level': 8,
                'max_stock_level': 80,
                'rack_number': 'A1',
                'shelf_number': 'S2',
                'requires_prescription': False,
                'usage_instructions': 'Take 1 tablet every 6-8 hours with food. Do not exceed 3 tablets in 24 hours.',
                'side_effects': 'Stomach upset, heartburn, dizziness. Consult doctor if pain persists.',
            },
            {
                'name': 'Amoxicillin',
                'generic_name': 'Amoxicillin Trihydrate',
                'medicine_type': 'capsule',
                'manufacturer': 'Antibiotic Labs',
                'supplier_name': 'MediPharm Distributors',
                'composition': 'Amoxicillin Trihydrate 500mg',
                'strength': '500mg',
                'pack_size': '10 capsules',
                'purchase_price': Decimal('15.00'),
                'mrp': Decimal('45.00'),
                'selling_price': Decimal('40.00'),
                'gst_percentage': Decimal('12.00'),
                'hsn_code': '30041010',
                'quantity_in_stock': random.randint(10, 100),
                'reorder_level': 5,
                'max_stock_level': 50,
                'rack_number': 'B1',
                'shelf_number': 'S1',
                'requires_prescription': True,
                'usage_instructions': 'Take 1 capsule 3 times daily for 7-10 days or as prescribed by doctor.',
                'side_effects': 'Diarrhea, nausea, rash. Complete full course even if feeling better.',
            },
            {
                'name': 'Omeprazole',
                'generic_name': 'Omeprazole',
                'medicine_type': 'capsule',
                'manufacturer': 'DigestiveCare',
                'supplier_name': 'GastroMed Supplies',
                'composition': 'Omeprazole 20mg',
                'strength': '20mg',
                'pack_size': '14 capsules',
                'purchase_price': Decimal('8.00'),
                'mrp': Decimal('25.00'),
                'selling_price': Decimal('22.00'),
                'gst_percentage': Decimal('12.00'),
                'hsn_code': '30049011',
                'quantity_in_stock': random.randint(12, 120),
                'reorder_level': 6,
                'max_stock_level': 60,
                'rack_number': 'B2',
                'shelf_number': 'S1',
                'requires_prescription': True,
                'usage_instructions': 'Take 1 capsule daily before breakfast. Can be taken for 2-4 weeks.',
                'side_effects': 'Headache, diarrhea, nausea. Consult doctor if symptoms worsen.',
            },
            {
                'name': 'Cetirizine',
                'generic_name': 'Cetirizine Hydrochloride',
                'medicine_type': 'tablet',
                'manufacturer': 'AllergyRelief Inc',
                'supplier_name': 'MediMart Distributors',
                'composition': 'Cetirizine HCl 10mg',
                'strength': '10mg',
                'pack_size': '10 tablets',
                'purchase_price': Decimal('4.50'),
                'mrp': Decimal('12.00'),
                'selling_price': Decimal('10.50'),
                'gst_percentage': Decimal('12.00'),
                'hsn_code': '30049011',
                'quantity_in_stock': random.randint(25, 250),
                'reorder_level': 15,
                'max_stock_level': 120,
                'rack_number': 'C1',
                'shelf_number': 'S1',
                'requires_prescription': False,
                'usage_instructions': 'Take 1 tablet daily. Can be taken with or without food.',
                'side_effects': 'Drowsiness, dry mouth, fatigue. Avoid alcohol while taking this medication.',
            },
            {
                'name': 'Aspirin',
                'generic_name': 'Acetylsalicylic Acid',
                'medicine_type': 'tablet',
                'manufacturer': 'CardioCare Pharma',
                'supplier_name': 'HeartHealth Supplies',
                'composition': 'Aspirin 75mg',
                'strength': '75mg',
                'pack_size': '28 tablets',
                'purchase_price': Decimal('6.00'),
                'mrp': Decimal('18.00'),
                'selling_price': Decimal('16.00'),
                'gst_percentage': Decimal('12.00'),
                'hsn_code': '30049011',
                'quantity_in_stock': random.randint(18, 180),
                'reorder_level': 12,
                'max_stock_level': 90,
                'rack_number': 'C2',
                'shelf_number': 'S1',
                'requires_prescription': True,
                'usage_instructions': 'Take 1 tablet daily with food. Continue as prescribed by doctor.',
                'side_effects': 'Stomach irritation, bleeding risk. Consult doctor immediately if unusual bleeding occurs.',
            },
            {
                'name': 'Vitamin D3',
                'generic_name': 'Cholecalciferol',
                'medicine_type': 'capsule',
                'manufacturer': 'NutriHealth Labs',
                'supplier_name': 'Vitamin Distributors',
                'composition': 'Vitamin D3 60000 IU',
                'strength': '60000 IU',
                'pack_size': '4 capsules',
                'purchase_price': Decimal('25.00'),
                'mrp': Decimal('80.00'),
                'selling_price': Decimal('70.00'),
                'gst_percentage': Decimal('12.00'),
                'hsn_code': '30045010',
                'quantity_in_stock': random.randint(8, 80),
                'reorder_level': 4,
                'max_stock_level': 40,
                'rack_number': 'D1',
                'shelf_number': 'S1',
                'requires_prescription': False,
                'usage_instructions': 'Take 1 capsule weekly or as advised by doctor. Take with fatty meal for better absorption.',
                'side_effects': 'Rare: nausea, constipation. Consult doctor if taking other vitamin D supplements.',
            },
            {
                'name': 'Metformin',
                'generic_name': 'Metformin Hydrochloride',
                'medicine_type': 'tablet',
                'manufacturer': 'DiabetCare',
                'supplier_name': 'EndoMed Supplies',
                'composition': 'Metformin HCl 500mg',
                'strength': '500mg',
                'pack_size': '30 tablets',
                'purchase_price': Decimal('12.00'),
                'mrp': Decimal('35.00'),
                'selling_price': Decimal('32.00'),
                'gst_percentage': Decimal('12.00'),
                'hsn_code': '30049011',
                'quantity_in_stock': random.randint(10, 100),
                'reorder_level': 5,
                'max_stock_level': 50,
                'rack_number': 'D2',
                'shelf_number': 'S1',
                'requires_prescription': True,
                'usage_instructions': 'Take 1-2 tablets daily with meals. Regular blood sugar monitoring required.',
                'side_effects': 'Nausea, diarrhea, stomach upset. These usually improve with continued use.',
            },
            {
                'name': 'Loratadine',
                'generic_name': 'Loratadine',
                'medicine_type': 'tablet',
                'manufacturer': 'AllergyFree Pharma',
                'supplier_name': 'MediCare Distributors',
                'composition': 'Loratadine 10mg',
                'strength': '10mg',
                'pack_size': '10 tablets',
                'purchase_price': Decimal('5.00'),
                'mrp': Decimal('15.00'),
                'selling_price': Decimal('13.50'),
                'gst_percentage': Decimal('12.00'),
                'hsn_code': '30049011',
                'quantity_in_stock': random.randint(20, 200),
                'reorder_level': 10,
                'max_stock_level': 100,
                'rack_number': 'C1',
                'shelf_number': 'S2',
                'requires_prescription': False,
                'usage_instructions': 'Take 1 tablet daily. Non-drowsy formula, can be taken anytime.',
                'side_effects': 'Rare: headache, dry mouth. Usually well tolerated.',
            },
            {
                'name': 'Azithromycin',
                'generic_name': 'Azithromycin',
                'medicine_type': 'tablet',
                'manufacturer': 'InfectCare Labs',
                'supplier_name': 'Antibiotic Supplies',
                'composition': 'Azithromycin 500mg',
                'strength': '500mg',
                'pack_size': '3 tablets',
                'purchase_price': Decimal('18.00'),
                'mrp': Decimal('55.00'),
                'selling_price': Decimal('50.00'),
                'gst_percentage': Decimal('12.00'),
                'hsn_code': '30041010',
                'quantity_in_stock': random.randint(6, 60),
                'reorder_level': 3,
                'max_stock_level': 30,
                'rack_number': 'B1',
                'shelf_number': 'S2',
                'requires_prescription': True,
                'usage_instructions': 'Take 1 tablet daily for 3 days. Take with or without food.',
                'side_effects': 'Diarrhea, nausea, abdominal pain. Complete full course.',
            },
        ]

        # Medicine types for variety
        medicine_types = ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'cream', 'powder', 'drops']

        # Manufacturers for variety
        manufacturers = [
            'PharmaCorp', 'MediLabs', 'HealthCare Inc', 'BioPharm', 'MediTech',
            'CureAll Pharma', 'Wellness Labs', 'LifeCare', 'MediPlus', 'CarePharm'
        ]

        # Create medicines
        created_count = 0
        for i in range(count):
            if i < len(medicine_data):
                # Use predefined data
                data = medicine_data[i].copy()
                # Generate unique SKU and barcode for predefined medicines
                data['sku'] = f"SKU{str(i+1).zfill(4)}"
                data['barcode'] = f"BAR{str(i+1).zfill(6)}"
            else:
                # Generate random medicine
                base_data = random.choice(medicine_data)
                data = {
                    'name': f"{base_data['name']} {random.randint(100, 999)}",
                    'generic_name': base_data['generic_name'],
                    'medicine_type': random.choice(medicine_types),
                    'manufacturer': random.choice(manufacturers),
                    'supplier_name': f"Supplier {random.randint(1, 20)}",
                    'composition': base_data['composition'],
                    'strength': base_data['strength'],
                    'pack_size': base_data['pack_size'],
                    'purchase_price': Decimal(str(random.uniform(1, 50))).quantize(Decimal('0.01')),
                    'mrp': Decimal(str(random.uniform(5, 150))).quantize(Decimal('0.01')),
                    'selling_price': Decimal(str(random.uniform(4, 120))).quantize(Decimal('0.01')),
                    'gst_percentage': Decimal('12.00'),
                    'hsn_code': base_data['hsn_code'],
                    'quantity_in_stock': random.randint(5, 200),
                    'reorder_level': random.randint(5, 20),
                    'max_stock_level': random.randint(50, 200),
                    'rack_number': f"{random.choice('ABCDEFGH')}{random.randint(1, 5)}",
                    'shelf_number': f"S{random.randint(1, 10)}",
                    'requires_prescription': random.choice([True, False]),
                    'usage_instructions': base_data['usage_instructions'],
                    'side_effects': base_data['side_effects'],
                    'sku': f"SKU{str(i+1).zfill(4)}",
                    'barcode': f"BAR{str(i+1).zfill(6)}",
                }

            try:
                # Check if medicine already exists
                if Medicine.objects.filter(name=data['name']).exists():
                    self.stdout.write(
                        self.style.WARNING(f'Medicine "{data["name"]}" already exists. Skipping.')
                    )
                    continue

                medicine = Medicine.objects.create(**data)
                created_count += 1

                if created_count % 10 == 0:
                    self.stdout.write(f'Created {created_count} medicines...')

            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f'Failed to create medicine "{data["name"]}": {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} medicines.')
        )
