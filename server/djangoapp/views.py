from django.http import JsonResponse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
import json
import logging
import os
from pathlib import Path
from django.conf import settings

from .populate import initiate
from .models import CarMake, CarModel
from .restapis import get_request, analyze_review_sentiments, post_review

# Logger seadistamine
logger = logging.getLogger(__name__)

@csrf_exempt
def login_user(request):
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    user = authenticate(username=username, password=password)
    data = {"userName": username}
    if user is not None:
        login(request, user)
        data["status"] = "Authenticated"
    else:
        data["status"] = "Error"
        data["message"] = "Invalid credentials"
    return JsonResponse(data)

def logout_request(request):
    logout(request)
    data = {"userName": ""}
    return JsonResponse(data)

@csrf_exempt
def register(request):
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    first_name = data['firstName']
    last_name = data['lastName']
    email = data['email']
    
    username_exist = False

    try:
        User.objects.get(username=username)
        username_exist = True
    except User.DoesNotExist:
        logger.debug(f"{username} on uus kasutaja")

    if not username_exist:
        user = User.objects.create_user(username=username, first_name=first_name, last_name=last_name, password=password, email=email)
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
        return JsonResponse(data)
    else:
        data = {"userName": username, "error": "Already Registered"}
        return JsonResponse(data)

def get_cars(request):
    try:
        # Määrame faili tee
        file_path = os.path.join(settings.BASE_DIR, "database", "data", "car_records.json")
        
        # Kontrollime, kas fail eksisteerib
        if not os.path.exists(file_path):
            return JsonResponse({"error": "Car records file not found"}, status=404)
        
        # Loeme faili
        with open(file_path, "r") as file:
            data = json.load(file)
        
        # Kontrollime, kas JSON-struktuur on korrektne
        if "cars" not in data or not isinstance(data["cars"], list):
            return JsonResponse({"error": "Invalid JSON structure in car_records.json"}, status=500)
        
        # Tagastame autode andmed
        return JsonResponse({"cars": data["cars"]}, status=200)
    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Error decoding JSON file"}, status=500)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



BASE_DIR = Path(__file__).resolve().parent.parent

def get_dealerships(request, state="All"):
    # Failitee
    file_path = os.path.join(settings.BASE_DIR, "database", "data", "dealerships.json")
    
    try:
        # Laadime JSON-andmed failist
        with open(file_path, "r") as file:
            data = json.load(file)

        # Kontrollime, et "dealerships" võti on olemas ja on list
        if not isinstance(data, dict) or "dealerships" not in data or not isinstance(data["dealerships"], list):
            return JsonResponse({"status": 500, "message": "Invalid JSON structure: 'dealerships' key missing or not a list"})
        
        dealerships = data["dealerships"]

        # Kontrollime, et kõik kirjed on sõnastikud
        dealerships = [dealer for dealer in dealerships if isinstance(dealer, dict)]

        # Kui osariik on määratud, filtreerime dealerid osariigi järgi
        if state != "All":
            dealerships = [
                dealer for dealer in dealerships if dealer.get("state", "").lower() == state.lower()
            ]

        # Kui filtreerimise tulemus on tühi
        if not dealerships:
            return JsonResponse({"status": 404, "message": f"No dealerships found for state: {state}"})

        return JsonResponse({"status": 200, "dealers": {"dealerships": dealerships}})
    
    except FileNotFoundError:
        return JsonResponse({"status": 404, "message": f"Dealerships file not found: {file_path}"})
    except json.JSONDecodeError:
        return JsonResponse({"status": 500, "message": "Error decoding JSON file"})
    except Exception as e:
        return JsonResponse({"status": 500, "message": f"An unexpected error occurred: {str(e)}"})

""" def get_dealerships(request, state="All"):
    # Ajutised testandmed
    dealerships = [
        {"id": 1, "name": "Dealer One", "city": "New York", "state": "NY"},
        {"id": 2, "name": "Dealer Two", "city": "Los Angeles", "state": "CA"},
    ]
    return JsonResponse({"status": 200, "dealers": dealerships})
 """
def get_dealer_reviews(request, dealer_id):
    try:
        # Failitee
        file_path = os.path.join(settings.BASE_DIR, "database", "data", "reviews.json")
        
        # Lae fail andmed igal päringul
        with open(file_path, "r") as file:
            data = json.load(file)

        # Filtreeri arvustused
        reviews = data.get("reviews", [])
        dealer_reviews = [review for review in reviews if review.get("dealership") == dealer_id]

        if not dealer_reviews:
            return JsonResponse({"status": 404, "message": f"No reviews found for dealer ID {dealer_id}"})

        return JsonResponse({"status": 200, "reviews": dealer_reviews})
    except FileNotFoundError:
        return JsonResponse({"status": 404, "message": "Reviews file not found"})
    except Exception as e:
        return JsonResponse({"status": 500, "message": f"An error occurred: {str(e)}"})



def get_dealer_details(request, dealer_id):
    # Failitee
    file_path = os.path.join(settings.BASE_DIR, "database", "data", "dealerships.json")

    try:
        # Laadime JSON-andmed failist
        with open(file_path, "r") as file:
            data = json.load(file)

        # Kontrollime, et "dealerships" võti on olemas ja on list
        if not isinstance(data, dict) or "dealerships" not in data or not isinstance(data["dealerships"], list):
            return JsonResponse({"status": 500, "message": "Invalid JSON structure: 'dealerships' key missing or not a list"})

        dealerships = data["dealerships"]

        # Kontrollime, et kõik kirjed on sõnastikud
        dealerships = [dealer for dealer in dealerships if isinstance(dealer, dict)]

        # Otsime konkreetset dealerit `dealer_id` alusel
        dealer = next((dealer for dealer in dealerships if dealer.get("id") == dealer_id), None)

        # Kui dealeri andmeid ei leita
        if not dealer:
            return JsonResponse({"status": 404, "message": f"Dealer with ID {dealer_id} not found"})

        # Tagastame leitud dealeri andmed
        return JsonResponse({"status": 200, "dealer": dealer})
    
    except FileNotFoundError:
        return JsonResponse({"status": 404, "message": f"Dealerships file not found: {file_path}"})
    except json.JSONDecodeError:
        return JsonResponse({"status": 500, "message": "Error decoding JSON file"})
    except Exception as e:
        return JsonResponse({"status": 500, "message": f"An unexpected error occurred: {str(e)}"})


@csrf_exempt
def add_review(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            file_path = os.path.join(settings.BASE_DIR, "database", "data", "reviews.json")

            # Loeme olemasolevad arvustused
            with open(file_path, "r") as file:
                reviews_data = json.load(file)

            reviews = reviews_data.get("reviews", [])

            # Genereerime unikaalse ID
            if reviews:
                max_id = max(review.get("id", 0) for review in reviews)
            else:
                max_id = 0
            new_id = max_id + 1

            # Lisame ID ja andmed
            data["id"] = new_id
            reviews.append(data)

            # Kirjutame tagasi faili
            with open(file_path, "w") as file:
                json.dump({"reviews": reviews}, file, indent=4)

            # Tagastame ainult selle dealeri arvustused
            dealer_reviews = [review for review in reviews if review.get("dealership") == data["dealership"]]
            return JsonResponse({"status": 200, "message": "Review added successfully", "reviews": dealer_reviews})

        except Exception as e:
            return JsonResponse({"status": 500, "message": f"An error occurred: {e}"})
    return JsonResponse({"status": 400, "message": "Invalid request"})
