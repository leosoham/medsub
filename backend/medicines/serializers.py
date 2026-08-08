from rest_framework import serializers
from .models import Medicine


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = [
            "id",
            "medicine_name",
            "composition_normalized",
            "price",
            "manufacturer",
            "dosage_form",
            "uses",
            "side_effects",
        ]