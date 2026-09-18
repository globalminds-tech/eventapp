from dotenv import load_dotenv
load_dotenv()
import requests, json

# 1. Test create-order
print("=== Testing create-order ===")
r = requests.post("http://localhost:5001/api/v1/payments/create-order", json={"amount": 100, "currency": "INR", "receipt": "test_rcpt_001"})
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")
print()

if r.status_code == 200:
    data = r.json()
    order = data.get("data", data).get("order", {})
    order_id = order.get("id", "")
    key_id = data.get("data", data).get("key_id", "")
    print(f"Order ID: {order_id}")
    print(f"Key ID: {key_id}")
    is_test = order_id.startswith("order_test_")
    is_real = order_id.startswith("order_")
    print(f"Is test order: {is_test}")
    print(f"Is real Razorpay order: {is_real and not is_test}")
