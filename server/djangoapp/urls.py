from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .views import (
    register,
    login_user,
    logout_request,
    get_cars,
    get_dealerships,
    get_dealer_details,
    get_dealer_reviews,
    add_review,
)

app_name = 'djangoapp'

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_request, name='logout'),
    path('get_cars/', get_cars, name='get_cars'),
    path('get_dealers/', get_dealerships, name='get_dealers'),
    path('get_dealers/<str:state>/', get_dealerships,
         name='get_dealers_by_state'),
    path('dealer/<int:dealer_id>/', get_dealer_details, name='dealer_details'),
    path('reviews/dealer/<int:dealer_id>/',
         get_dealer_reviews, name='dealer_reviews'),
    path('add_review/', add_review, name='add_review'),
]

# Lisage meediafailide teenindamiseks ainult arenduskeskkonnas
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
