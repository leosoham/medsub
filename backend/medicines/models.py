from django.db import models


class Medicine(models.Model):
    id = models.BigAutoField(primary_key=True)
    source_id = models.IntegerField(blank=True, null=True)
    medicine_name = models.CharField(max_length=255)
    name_normalized = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    manufacturer = models.CharField(max_length=255, blank=True, null=True)
    dosage_form = models.CharField(max_length=100, blank=True, null=True)
    pack_size_label = models.CharField(max_length=255, blank=True, null=True)
    composition = models.TextField(blank=True, null=True)
    composition_normalized = models.TextField(blank=True, null=True)
    uses = models.TextField(blank=True, null=True)
    substitutes_list = models.TextField(blank=True, null=True)
    side_effects = models.TextField(blank=True, null=True)
    therapeutic_class = models.CharField(max_length=255, blank=True, null=True)
    medicine_desc = models.TextField(blank=True, null=True)
    drug_interactions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "medicines"

