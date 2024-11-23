from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

class CarMake(models.Model):
    name = models.CharField(max_length=255)  # Name of the car make
    description = models.TextField()         # Description of the car make

    def __str__(self):
        return self.name  # String representation of CarMake


class CarModel(models.Model):
    CAR_TYPES = [
        ('SEDAN', 'Sedan'),
        ('SUV', 'SUV'),
        ('WAGON', 'Wagon'),
        ('COUPE', 'Coupe'),
        ('HATCHBACK', 'Hatchback'),
    ]

    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE)  # Many-to-One relationship
    name = models.CharField(max_length=100)  # Name of the car model
    dealer_id = models.IntegerField()  # Refers to a dealer created in the external database
    car_type = models.CharField(max_length=10, choices=CAR_TYPES, default='SUV')  # Type of car
    year = models.DateField()  # Year as a DateField

    def __str__(self):
        return f"{self.car_make.name} {self.name}"  # String representation of CarModel
