from django.contrib import admin
from .models import CarMake, CarModel

# Registering the CarMake model
admin.site.register(CarMake)

# Registering the CarModel model
admin.site.register(CarModel)
