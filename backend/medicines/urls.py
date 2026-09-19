from django.urls import path

from .views import substitutes, search_medicine, health, explain_medicine

urlpatterns = [

    path(
        "medicine/<str:name>/substitutes/",
        substitutes,
        name="substitutes"
    ),

    path(
        "medicine/<str:name>/explain/",
        explain_medicine,
        name="explain_medicine"
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