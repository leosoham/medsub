# Medicine Substitute API Documentation

## Base URL

```
http://127.0.0.1:8000/api/
```

---

# Search Medicine API

### Endpoint

```
GET /search/?q=<medicine_name>
```

### Example

```
GET /search/?q=dolo
```

### Sample Response

```json
[
    {
        "medicine_name": "Dolo 650 Tablet"
    }
]
```

---

# Medicine Substitute API

### Endpoint

```
GET /medicine/<medicine_name>/substitutes/
```

### Example

```
GET /medicine/Dolo%20650/substitutes/
```

---

## Query Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| manufacturer | Cipla | Filter by manufacturer |
| dosage_form | Tablets | Filter by dosage form |
| min_price | 5 | Minimum price |
| max_price | 50 | Maximum price |
| sort | price_low | Lowest price first |
| sort | price_high | Highest price first |
| sort | name | Alphabetical order |

---

## Example

```
GET /medicine/Dolo%20650/substitutes/?manufacturer=Cipla&max_price=50&sort=price_low
```

---

# Health API

### Endpoint

```
GET /health/
```

### Response

```json
{
    "status": "ok",
    "message": "Medicine Substitute API is running."
}
```