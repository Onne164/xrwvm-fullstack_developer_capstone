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

    # Siia tuleb ülejäänud teed (näiteks registreerimine, ülevaated jne)
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
