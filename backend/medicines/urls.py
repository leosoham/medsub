
from django.urls import path

from .views import (
    substitutes,
    search_medicine,
    health,
    explain_medicine,
    symptom_search,
    prescription_upload,
    prescription_confirm,
)

urlpatterns = [
    path(
        "substitutes/<str:name>/",
        substitutes,
        name="substitutes",
    ),
    path(
        "search/",
        search_medicine,
        name="search_medicine",
    ),
    path(
        "health/",
        health,
        name="health",
    ),
    path(
        "explain/<str:name>/",
        explain_medicine,
        name="explain_medicine",
    ),
    path(
        "symptom-search/",
        symptom_search,
        name="symptom_search",
    ),
    path(
        "prescription-upload/",
        prescription_upload,
        name="prescription_upload",
    ),
    path(
        "prescription-confirm/",
        prescription_confirm,
        name="prescription_confirm",
    ),
]
