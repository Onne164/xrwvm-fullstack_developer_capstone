from django.db import models


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

    # Many-to-One relationship
    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # Name of the car model
    # Refers to a dealer created in the external database
    dealer_id = models.IntegerField()
    car_type = models.CharField(
        max_length=10, choices=CAR_TYPES, default='SUV')  # Type of car
    year = models.DateField()  # Year as a DateField

    def __str__(self):
        # String representation of CarModel
        return f"{self.car_make.name} {self.name}"
