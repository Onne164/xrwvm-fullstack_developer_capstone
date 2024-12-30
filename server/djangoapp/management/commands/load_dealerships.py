import json
from django.core.management.base import BaseCommand
from djangoapp.models import Dealer


class Command(BaseCommand):
    help = 'Laadib dealerite andmed JSON failist andmebaasi'

    def handle(self, *args, **kwargs):
        with open('database/data/dealerships.json') as file:
            data = json.load(file)
            for item in data:
                Dealer.objects.create(
                    full_name=item['full_name'],
                    city=item['city'],
                    address=item['address'],
                    zip=item['zip'],
                    state=item['state']
                )
        self.stdout.write(self.style.SUCCESS('Andmed laaditud edukalt'))
