import pytest
from app.security import (
    hash_password,
    verify_password,
    encrypt_secret,
    decrypt_secret,
    create_access_token,
    decode_access_token
)

@pytest.mark.asyncio
async def test_password_hashing():
    pw = "SecretP@ssw0rd2026!"
    hashed = hash_password(pw)
    assert hashed != pw
    assert "$" in hashed
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

@pytest.mark.asyncio
async def test_token_encryption_at_rest():
    secret_token = "eaafb_super_confidential_social_media_token_12345"
    encrypted = encrypt_secret(secret_token)
    assert encrypted is not None
    assert encrypted != secret_token
    decrypted = decrypt_secret(encrypted)
    assert decrypted == secret_token

@pytest.mark.asyncio
async def test_jwt_generation_and_validation():
    data = {"sub": "user_123", "role": "admin"}
    token = create_access_token(data)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user_123"
    assert decoded["role"] == "admin"
    assert "exp" in decoded

@pytest.mark.asyncio
async def test_auth_api_flow(async_client):
    # Register
    reg_resp = await async_client.post("/api/v1/auth/register", json={
        "email": "director@marketing.com",
        "password": "SecurePassword123!",
        "full_name": "Marketing Director",
        "timezone": "America/New_York"
    })
    assert reg_resp.status_code == 200
    data = reg_resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "director@marketing.com"

    # Login
    login_resp = await async_client.post("/api/v1/auth/login", json={
        "email": "director@marketing.com",
        "password": "SecurePassword123!"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Access /me with Bearer token
    me_resp = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "director@marketing.com"
