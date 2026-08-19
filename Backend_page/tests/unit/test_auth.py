def test_register_user(client):
    res = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "secretpassword",
        "role": "visitor"
    })
    assert res.status_code == 200
    assert res.json.get("message") == "User registered successfully"

def test_login_user(client):
    client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "login@example.com",
        "password": "secretpassword",
        "role": "visitor"
    })
    res = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "secretpassword"
    })
    assert res.status_code == 200
    assert "token" in res.json
