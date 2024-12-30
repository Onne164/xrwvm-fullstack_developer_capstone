from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os
import json
import logging

# Logger seadistamine
logger = logging.getLogger(__name__)


def get_dealerships(request, state="All"):
    file_path = os.path.join(
        settings.BASE_DIR, "database", "data", "dealerships.json"
    )

    try:
        # Loeme JSON-andmed failist
        with open(file_path, "r") as file:
            data = json.load(file)

        # Kontrollime, kas JSON-struktuur on korrektne
        if not isinstance(data, dict) or not isinstance(
            data.get("dealerships"), list
        ):
            return JsonResponse(
                {"status": 500, "message": "Invalid JSON structure"}
            )

        # Filtreerime ainult sõnastikku vastavad kirjed
        dealerships = [
            dealer for dealer in data["dealerships"]
            if isinstance(dealer, dict)
        ]

        # Filtreerime osariigi järgi, kui see on määratud
        if state != "All":
            dealerships = [
                dealer for dealer in dealerships
                if dealer.get("state", "").lower() == state.lower()
            ]

        # Kui tulemusi ei leitud
        if not dealerships:
            return JsonResponse(
                {
                    "status": 404,
                    "message": (
                        f"No dealerships found for state: {state}"
                    ),
                }
            )

        # Tagastame tulemused
        return JsonResponse(
            {"status": 200, "dealers": {"dealerships": dealerships}}
        )

    except FileNotFoundError:
        # Faili ei leitud
        return JsonResponse(
            {
                "status": 404,
                "message": (
                    f"Dealerships file not found: {file_path}"
                ),
            }
        )
    except json.JSONDecodeError:
        # JSON-i dekodeerimisviga
        return JsonResponse(
            {"status": 500, "message": "Error decoding JSON file"}
        )
    except Exception as e:
        # Muu ootamatu viga
        return JsonResponse(
            {
                "status": 500,
                "message": (
                    f"An unexpected error occurred: {str(e)}"
                ),
            }
        )


@csrf_exempt
def add_review(request):
    if request.method == "POST":
        try:
            # Loeme päringu sisu
            data = json.loads(request.body)
            file_path = os.path.join(
                settings.BASE_DIR, "database", "data", "reviews.json"
            )

            # Loeme olemasolevad arvustused
            with open(file_path, "r") as file:
                reviews_data = json.load(file)

            reviews = reviews_data.get("reviews", [])

            # Genereerime uue ID
            max_id = max(
                review.get("id", 0) for review in reviews
            ) if reviews else 0
            new_id = max_id + 1

            # Lisame uue arvustuse
            data["id"] = new_id
            reviews.append(data)

            # Salvestame uuendatud andmed
            with open(file_path, "w") as file:
                json.dump({"reviews": reviews}, file, indent=4)

            # Tagastame ainult vastava dealeri arvustused
            dealer_reviews = [
                review for review in reviews
                if review.get("dealership") == data["dealership"]
            ]
            return JsonResponse(
                {
                    "status": 200,
                    "message": "Review added successfully",
                    "reviews": dealer_reviews,
                }
            )

        except Exception as e:
            return JsonResponse(
                {"status": 500, "message": f"An error occurred: {e}"}
            )
    return JsonResponse({"status": 400, "message": "Invalid request"})
