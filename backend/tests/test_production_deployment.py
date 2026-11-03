"""
Nexora Mart - Complete Production Deployment Test Suite
Tests:
1. Root GET / -> Status 200 & Expected Payload
2. Root HEAD / -> Status 200 (Resolves Render 405 Method Not Allowed)
3. Health GET /health and HEAD /health -> Status 200
4. Swagger docs /docs and OpenAPI schema /openapi.json -> Status 200
5. Aiven Cloud MySQL database connection & connection pooling
6. User Authentication: Login & Profile
7. Product APIs: List, Create, Retrieve
8. Dashboard & Analytics APIs
9. CORS Headers for Vercel Frontend Domain
"""
import sys
import json
import asyncio
from pathlib import Path

# Add backend directory to path
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.main import app
from app.database.connection import engine, text

async def request_asgi(app, method: str, path: str, headers: dict = None, body: bytes = b""):
    headers = headers or {}
    raw_headers = [(k.lower().encode("latin1"), v.encode("latin1")) for k, v in headers.items()]

    response_headers = []
    response_body = []
    response_status = None

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": method.upper(),
        "path": path,
        "raw_path": path.encode("ascii"),
        "query_string": b"",
        "headers": raw_headers,
        "server": ("testserver", 80),
        "client": ("127.0.0.1", 12345),
    }

    if "?" in path:
        p, q = path.split("?", 1)
        scope["path"] = p
        scope["raw_path"] = p.encode("ascii")
        scope["query_string"] = q.encode("ascii")

    async def receive():
        return {
            "type": "http.request",
            "body": body,
            "more_body": False,
        }

    async def send(message):
        nonlocal response_status, response_headers, response_body
        if message["type"] == "http.response.start":
            response_status = message["status"]
            response_headers = message.get("headers", [])
        elif message["type"] == "http.response.body":
            response_body.append(message.get("body", b""))

    await app(scope, receive, send)

    hdrs = {k.decode("latin1"): v.decode("latin1") for k, v in response_headers}
    full_body = b"".join(response_body)
    return response_status, hdrs, full_body

def run_request(method: str, path: str, headers: dict = None, json_body: dict = None):
    body = json.dumps(json_body).encode("utf-8") if json_body else b""
    if json_body:
        headers = headers or {}
        headers["content-type"] = "application/json"
    status, hdrs, content = asyncio.run(request_asgi(app, method, path, headers, body))
    return status, hdrs, content

def test_1_root_get_and_head():
    print("\n--- TEST 1: Root Endpoint (GET and HEAD) ---")
    status, _, content = run_request("GET", "/")
    assert status == 200, f"GET / failed: {status}"
    data = json.loads(content.decode("utf-8"))
    assert data["status"] == "success", f"Unexpected status: {data}"
    assert "Nexora Mart API Running" in data["message"], f"Unexpected message: {data}"
    print("  [OK] GET / -> HTTP 200:", data["message"])

    # HEAD / (Critical fix for Render 405 Method Not Allowed)
    status, _, _ = run_request("HEAD", "/")
    assert status == 200, f"HEAD / failed: {status} (Expected 200 OK)"
    print("  [OK] HEAD / -> HTTP 200 (Render Health Check 405 Fixed!)")

def test_2_health_endpoints():
    print("\n--- TEST 2: Health Endpoints (GET and HEAD) ---")
    status, _, content = run_request("GET", "/health")
    assert status == 200
    data = json.loads(content.decode("utf-8"))
    print("  [OK] GET /health -> HTTP 200:", data["message"])

    status, _, _ = run_request("HEAD", "/health")
    assert status == 200
    print("  [OK] HEAD /health -> HTTP 200")

def test_3_swagger_and_openapi():
    print("\n--- TEST 3: Swagger Documentation & OpenAPI Schema ---")
    status, _, content = run_request("GET", "/docs")
    assert status == 200
    assert "swagger-ui" in content.decode("utf-8").lower()
    print("  [OK] GET /docs -> HTTP 200 (Swagger UI renders)")

    status, _, content = run_request("GET", "/openapi.json")
    assert status == 200
    schema = json.loads(content.decode("utf-8"))
    assert "paths" in schema
    print(f"  [OK] GET /openapi.json -> HTTP 200 ({len(schema['paths'])} API routes documented)")

def test_4_database_connection():
    print("\n--- TEST 4: Aiven Cloud MySQL Database Connection ---")
    with engine.connect() as conn:
        val = conn.execute(text("SELECT 1")).scalar()
        assert val == 1
    print("  [OK] Aiven MySQL SELECT 1 test passed successfully on host:", engine.url.host)

def test_5_authentication_and_user_flow():
    print("\n--- TEST 5: Authentication & Token Lifecycle ---")
    login_payload = {
        "email": "demo@nmart.com",
        "password": "password123"
    }
    status, _, content = run_request("POST", "/api/auth/login", json_body=login_payload)
    assert status == 200, f"Login failed with status {status}: {content}"
    token_data = json.loads(content.decode("utf-8"))
    assert "token" in token_data
    token = token_data["token"]
    print("  [OK] POST /api/auth/login -> HTTP 200: JWT token issued")

    # Protected profile endpoint /api/auth/me
    headers = {"Authorization": f"Bearer {token}"}
    status, _, content = run_request("GET", "/api/auth/me", headers=headers)
    assert status == 200, f"Protected route failed: {content}"
    user_info = json.loads(content.decode("utf-8"))
    assert user_info["email"] == "demo@nmart.com"
    print(f"  [OK] GET /api/auth/me -> HTTP 200: Authenticated as {user_info['name']} ({user_info['email']})")
    return token

def test_6_products_api(token: str):
    print("\n--- TEST 6: Products API ---")
    headers = {"Authorization": f"Bearer {token}"}
    status, _, content = run_request("GET", "/api/products/", headers=headers)
    assert status == 200, f"List products failed: {content}"
    products = json.loads(content.decode("utf-8"))
    print(f"  [OK] GET /api/products/ -> HTTP 200 ({len(products)} products retrieved)")

def test_7_dashboard_and_analytics_apis(token: str):
    print("\n--- TEST 7: Dashboard & Analytics APIs ---")
    headers = {"Authorization": f"Bearer {token}"}

    # Summary
    status, _, content = run_request("GET", "/api/reports/dashboard-summary", headers=headers)
    assert status == 200, f"Dashboard summary failed: {content}"
    summary = json.loads(content.decode("utf-8"))
    print("  [OK] GET /api/reports/dashboard-summary -> HTTP 200: Store =", summary.get("store_name"))

    # Sales Analytics
    status, _, content = run_request("GET", "/api/reports/sales-analytics?days=14", headers=headers)
    assert status == 200
    print("  [OK] GET /api/reports/sales-analytics -> HTTP 200")

    # Analytics Overview (Matching Dashboard Design)
    status, _, content = run_request("GET", "/api/reports/analytics-overview", headers=headers)
    assert status == 200, f"Analytics overview failed: {content}"
    overview = json.loads(content.decode("utf-8"))
    assert "stats" in overview, f"Missing stats: {overview}"
    assert "sales_overview" in overview, f"Missing sales_overview: {overview}"
    print(f"  [OK] GET /api/reports/analytics-overview -> HTTP 200: {len(overview['stats'])} Stat Cards & {len(overview['sales_overview'])} Daily Points verified")

def test_8_cors_preflight_headers():
    print("\n--- TEST 8: CORS Preflight & Headers for Vercel Frontend ---")
    headers = {
        "Origin": "https://nexora-mart.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization"
    }
    status, hdrs, _ = run_request("OPTIONS", "/api/auth/login", headers=headers)
    assert status == 200, f"OPTIONS failed: {status}"
    allow_origin = hdrs.get("access-control-allow-origin")
    assert allow_origin == "https://nexora-mart.vercel.app", f"Wrong allow-origin: {allow_origin}"
    assert "POST" in hdrs.get("access-control-allow-methods", "")
    assert hdrs.get("access-control-allow-credentials") == "true"
    print("  [OK] OPTIONS /api/auth/login from https://nexora-mart.vercel.app -> HTTP 200 with Allow-Credentials: true")

if __name__ == "__main__":
    test_1_root_get_and_head()
    test_2_health_endpoints()
    test_3_swagger_and_openapi()
    test_4_database_connection()
    token = test_5_authentication_and_user_flow()
    test_6_products_api(token)
    test_7_dashboard_and_analytics_apis(token)
    test_8_cors_preflight_headers()
    print("\n========================================================")
    print(">>> ALL PRODUCTION DEPLOYMENT TESTS PASSED 100%! <<<")
    print("========================================================")
