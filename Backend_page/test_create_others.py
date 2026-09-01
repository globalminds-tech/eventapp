import requests

print("Testing Vendor")
try:
    res = requests.post("http://localhost:5001/superadmin/api/create_vendor", json={
        "vendor_type": "Catering",
        "vendor_name": "Test Vendor",
        "company_name": "Test Co",
        "primary_contact": "1234567890",
        "mail_id": "test@test.com",
        "address": "test addr",
        "organizer_id": 1
    })
    print(res.status_code, res.text)
except Exception as e:
    print(e)

print("Testing Sponsor")
try:
    res = requests.post("http://localhost:5001/superadmin/api/sponsorship", json={
        "sponsor_name": "Test Sponsor",
        "primary_contact": "1234567890",
        "mail_id": "test@test.com",
        "address": "test addr",
        "organizer_id": 1
    })
    print(res.status_code, res.text)
except Exception as e:
    print(e)
