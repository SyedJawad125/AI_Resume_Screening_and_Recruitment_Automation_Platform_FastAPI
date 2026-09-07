"""
tests/test_health.py
──────────────────────
Smoke test: app boots and /health responds. Run with:
    pytest
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check_responds():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert "status" in body
    assert body["app"] == "HireMind AI"
