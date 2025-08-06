#!/usr/bin/env python3
"""
Simple test script to verify API connectivity and CRUD operations
"""

import requests
import json
import sys

BASE_URL = "http://localhost:3001/api"


def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL.replace('/api', '')}/api/health")
        print(f"✅ Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False


def test_get_assets():
    """Test getting all assets"""
    try:
        response = requests.get(f"{BASE_URL}/assets")
        print(f"✅ GET /assets: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Found {len(data.get('data', []))} assets")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ GET /assets failed: {e}")
        return False


def test_create_asset():
    """Test creating a new asset"""
    try:
        test_asset = {
            "hostname": "test-server",
            "ipAddress": "192.168.1.100",
            "os": {"name": "Ubuntu", "version": "22.04"},
        }

        response = requests.post(f"{BASE_URL}/assets", json=test_asset)
        print(f"✅ POST /assets: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            asset_id = data.get("data", {}).get("id")
            print(f"   Created asset with ID: {asset_id}")
            return asset_id
        else:
            print(f"   Error: {response.text}")
        return None
    except Exception as e:
        print(f"❌ POST /assets failed: {e}")
        return None


def test_update_asset(asset_id):
    """Test updating an asset"""
    if not asset_id:
        return False

    try:
        update_data = {"hostname": "test-server-updated", "os": {"name": "CentOS"}}

        response = requests.put(f"{BASE_URL}/assets/{asset_id}", json=update_data)
        print(f"✅ PUT /assets/{asset_id}: {response.status_code}")
        if response.status_code == 200:
            print(f"   Asset updated successfully")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ PUT /assets/{asset_id} failed: {e}")
        return False


def test_get_asset(asset_id):
    """Test getting a specific asset"""
    if not asset_id:
        return False

    try:
        response = requests.get(f"{BASE_URL}/assets/{asset_id}")
        print(f"✅ GET /assets/{asset_id}: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Asset hostname: {data.get('data', {}).get('hostname', 'N/A')}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ GET /assets/{asset_id} failed: {e}")
        return False


def test_delete_asset(asset_id):
    """Test deleting an asset"""
    if not asset_id:
        return False

    try:
        response = requests.delete(f"{BASE_URL}/assets/{asset_id}")
        print(f"✅ DELETE /assets/{asset_id}: {response.status_code}")
        if response.status_code == 200:
            print(f"   Asset deleted successfully")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ DELETE /assets/{asset_id} failed: {e}")
        return False


def main():
    """Run all tests"""
    print("🧪 Testing Assets API Connectivity")
    print("=" * 50)

    # Test health endpoint
    if not test_health():
        print("❌ Backend is not running or health check failed")
        sys.exit(1)

    print()

    # Test GET assets
    test_get_assets()

    print()

    # Test CRUD operations
    print("🔄 Testing CRUD Operations")
    print("-" * 30)

    # Create
    asset_id = test_create_asset()

    # Read
    test_get_asset(asset_id)

    # Update
    test_update_asset(asset_id)

    # Delete
    test_delete_asset(asset_id)

    print()
    print("✅ All tests completed!")


if __name__ == "__main__":
    main()
