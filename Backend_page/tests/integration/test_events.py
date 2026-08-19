def test_events_summary(client):
    res = client.get("/api/events/summary")
    assert res.status_code == 200
    assert res.json.get("status") is True
