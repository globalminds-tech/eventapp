"""
Test script to verify that booking confirmation emails include
all attendee-selected details: pass type, food/meal, vehicle parking.

Run from Backend_page directory:
  python scripts/test_booking_email.py
"""
import sys, os, json, importlib, importlib.util, types

# Ensure app is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Bypass the full app __init__ import chain by stubbing 'app' as a package
# and importing email_templates directly
app_pkg = types.ModuleType('app')
app_pkg.__path__ = [os.path.join(os.path.dirname(__file__), '..', 'app')]
sys.modules['app'] = app_pkg

services_pkg = types.ModuleType('app.Services')
services_pkg.__path__ = [os.path.join(os.path.dirname(__file__), '..', 'app', 'Services')]
sys.modules['app.Services'] = services_pkg

# Stub app.config for Config.FRONTEND_URL
config_mod = types.ModuleType('app.config')
class Config:
    FRONTEND_URL = "https://bookmyevent.com"
config_mod.Config = Config
sys.modules['app.config'] = config_mod

# Now import email_templates directly
spec = importlib.util.spec_from_file_location(
    "app.Services.email_templates",
    os.path.join(os.path.dirname(__file__), '..', 'app', 'Services', 'email_templates.py')
)
email_templates = importlib.util.module_from_spec(spec)
sys.modules['app.Services.email_templates'] = email_templates
spec.loader.exec_module(email_templates)

get_booking_email_template = email_templates.get_booking_email_template

# ============================================
# Simulate the exact payload the frontend sends
# ============================================

# 1. Food details (JSON array from frontend selectedFoods)
food_details_json = json.dumps([
    {"meal_type": "Lunch", "food_type": "Veg", "caterer_name": "Annapurna Catering", "price_inr": 250},
    {"meal_type": "Dinner", "food_type": "Non-Veg", "caterer_name": "Royal Kitchen", "price_inr": 450}
])

# 2. Vehicle details (JSON object from frontend selectedVehicles + selectedAddons)
vehicle_details_json = json.dumps({
    "passes": [
        {"vehicle_type": "Car", "price_inr": 200},
        {"vehicle_type": "Bike", "price_inr": 50}
    ],
    "addons": [
        {"addon_name": "Valet Parking", "price": 500},
        {"addon_name": "VIP Reserved Spot", "price": 300}
    ]
})

# 3. Full event_dict as constructed in user_service.py book_event
event_dict = {
    "event_name": "TechSummit 2026 International Expo",
    "category": "Technology",
    "venue": "Chennai Trade Centre",
    "address": "Nandambakkam, Chennai, Tamil Nadu 600089",
    "start_date": "25/10/2026",
    "start_time": "09:30 AM",
    "booking_id": "abc12345-def6-7890-ghij-klmnopqrstuv",
    "ticket_code": "BME-abc123-A1B2C3D4",
    "pass_type": "Group Pass",
    "group_size": 4,
    "ticket_count": 2,
    "requested_seats": 8,
    "phone": "9876543210",
    "food_preference": "Veg",
    "food_details": food_details_json,
    "vehicle_details": vehicle_details_json,
    "vehicle_number": "TN 09 AB 1234",
    "subtotal_amount": 5200.00,
    "tax_amount": 936.00,
    "amount_paid": 6136.00,
    "currency_code": "INR"
}

# ============================================
# Generate the email template
# ============================================
subject, html = get_booking_email_template(
    name="Durai Murugan",
    email="durai@example.com",
    event=event_dict,
    has_qr=True,
    food_preference="Veg"
)

# ============================================
# Verification Checks
# ============================================
checks = {
    "Subject contains event name": "TechSummit 2026" in subject,
    "Subject contains ticket code": "BME-abc123" in subject,
    
    # Pass Type & Capacity
    "Pass badge shows Group Pass": "Group Pass" in html,
    "Group size 4 Members in badge": "4 Members" in html,
    "Total reserved seats (8)": "8 Total Reserved Seats" in html,
    
    # Attendee Info
    "Attendee name rendered": "Durai Murugan" in html,
    "Attendee email rendered": "durai@example.com" in html,
    "Phone number rendered": "9876543210" in html,
    
    # Venue & Date
    "Venue rendered": "Chennai Trade Centre" in html,
    "Address rendered": "Nandambakkam" in html,
    "Date rendered": "25/10/2026" in html,
    "Time rendered": "09:30 AM" in html,
    
    # Food/Meal Details
    "MEAL PASSES section header": "MEAL PASSES" in html,
    "Lunch meal type in email": "Lunch" in html,
    "Annapurna Catering in email": "Annapurna Catering" in html,
    "Veg food type in email": "Veg" in html,
    "Dinner meal type in email": "Dinner" in html,
    "Royal Kitchen in email": "Royal Kitchen" in html,
    "Non-Veg food type in email": "Non-Veg" in html,
    "Food price 250": "250" in html,
    "Food price 450": "450" in html,
    
    # Vehicle Parking Details
    "VEHICLE PARKING section header": "VEHICLE PARKING" in html,
    "Car parking type in email": ("Car" in html and "Parking" in html),
    "Bike parking type in email": "Bike" in html,
    "Valet Parking addon in email": "Valet Parking" in html,
    "VIP Reserved Spot addon in email": "VIP Reserved Spot" in html,
    "Vehicle number plate in email": "TN 09 AB 1234" in html,
    
    # Financial Summary
    "Total amount 6,136": "6,136" in html,
    "Subtotal amount 5,200": "5,200" in html,
    "Tax amount 936": "936" in html,
    
    # QR Code
    "QR code image CID": "cid:qrcode" in html,
}

print("=" * 70)
print("BOOKING EMAIL TEMPLATE VERIFICATION REPORT")
print("=" * 70)

passed = 0
failed = 0
for check_name, result in checks.items():
    status = "PASS" if result else "FAIL"
    if result:
        passed += 1
    else:
        failed += 1
    print(f"  [{status}]  {check_name}")

print("-" * 70)
print(f"  Results: {passed}/{passed+failed} checks passed")
if failed == 0:
    print("  ALL CHECKS PASSED - Food, Vehicle, and Pass details correctly included in email!")
else:
    print(f"  WARNING: {failed} check(s) FAILED - Review the email template.")
print("=" * 70)

# Save HTML output for visual inspection
output_path = os.path.join(os.path.dirname(__file__), "booking_email_preview.html")
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html)
print(f"\nEmail HTML saved to: {output_path}")
print(f"Open in browser to visually inspect the booking confirmation email.")
