from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from django.views.generic import TemplateView
from . import views

app_name = 'djangoapp'

urlpatterns = [
    # Tee logimise jaoks, mis viib login_user vaate juurde
    path('login', views.login_user, name='login'),  # Teeb POST päringu kasutaja sisselogimiseks

    # Reacti rakenduse login leht (seda serveeritakse index.html kaudu)
    #path('react-login/', TemplateView.as_view(template_name="index.html"), name='login_react'),  # Teenus Reacti jaoks
     path('logout', views.logout_request, name='logout'),  # Logout URL
     path('register', views.registration, name='registration'),
    # Siia tuleb ülejäänud teed (näiteks registreerimine, ülevaated jne)
     path('get_cars', views.get_cars, name='getcars'),
     path(route='get_dealers', view=views.get_dealerships, name='get_dealers'),
     path(route='get_dealers/<str:state>', view=views.get_dealerships, name='get_dealers_by_state'),
     path(route='reviews/dealer/<int:dealer_id>', view=views.get_dealer_reviews, name='dealer_details'),
     path(route='dealer/<int:dealer_id>', view=views.get_dealer_details, name='dealer_details'),
     path(route='add_review', view=views.add_review, name='add_review'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
