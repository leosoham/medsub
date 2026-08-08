from django.urls import path
from .views import substitutes, search_medicine, health

urlpatterns = [

    path(
        "medicine/<str:name>/substitutes/",
        substitutes,
        name="substitutes"
    ),

    path(
        "search/",
        search_medicine,
        name="search_medicine"
    ),

    path(
        "health/",
        health,
        name="health"
    ),
]