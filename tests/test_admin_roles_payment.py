"""
Herbalife E-commerce API Tests - Admin Roles & Dual Payment System
Tests for: Admin Role Management (Yönetici/Admin), Card Payment (Iyzico/PayTR)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
SUPER_ADMIN_EMAIL = "admin@herbalife.com"
SUPER_ADMIN_PASSWORD = "admin123"
STANDARD_ADMIN_EMAIL = "standard_admin@herbalife.com"
STANDARD_ADMIN_PASSWORD = "admin123"


class TestAdminAuthentication:
    """Admin authentication and role tests"""
    
    def test_super_admin_login_returns_role(self):
        """Test that Yönetici (Super Admin) login returns role in response"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "role" in data
        assert data["role"] == "Yönetici"
        print(f"Super Admin login successful, role: {data['role']}")
    
    def test_standard_admin_login_returns_role(self):
        """Test that standard Admin login returns role in response"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STANDARD_ADMIN_EMAIL,
            "password": STANDARD_ADMIN_PASSWORD
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "role" in data
        assert data["role"] == "Admin"
        print(f"Standard Admin login successful, role: {data['role']}")
    
    def test_auth_me_returns_role_for_super_admin(self):
        """Test /api/auth/me returns role for Yönetici"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Get current user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "role" in data
        assert data["email"] == SUPER_ADMIN_EMAIL
        assert data["role"] == "Yönetici"
        print(f"Auth/me for Super Admin: {data}")
    
    def test_auth_me_returns_role_for_standard_admin(self):
        """Test /api/auth/me returns role for standard Admin"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STANDARD_ADMIN_EMAIL,
            "password": STANDARD_ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Get current user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "role" in data
        assert data["role"] == "Admin"
        print(f"Auth/me for Standard Admin: {data}")


class TestAdminUserManagement:
    """Admin user CRUD operations - only accessible by Yönetici"""
    
    @pytest.fixture
    def super_admin_token(self):
        """Get Yönetici token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def standard_admin_token(self):
        """Get standard Admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STANDARD_ADMIN_EMAIL,
            "password": STANDARD_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_admins_accessible_by_super_admin(self, super_admin_token):
        """Test /api/admins GET is accessible by Yönetici"""
        response = requests.get(f"{BASE_URL}/api/admins", headers={
            "Authorization": f"Bearer {super_admin_token}"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2  # At least super admin and standard admin
        
        # Verify response structure
        for admin in data:
            assert "id" in admin
            assert "email" in admin
            assert "role" in admin
            assert "created_at" in admin
            assert "password_hash" not in admin  # Password should not be exposed
        
        print(f"Found {len(data)} admin users")
    
    def test_get_admins_forbidden_for_standard_admin(self, standard_admin_token):
        """Test /api/admins GET returns 403 for standard Admin"""
        response = requests.get(f"{BASE_URL}/api/admins", headers={
            "Authorization": f"Bearer {standard_admin_token}"
        })
        
        assert response.status_code == 403
        data = response.json()
        assert "detail" in data
        assert "Yönetici" in data["detail"]  # Should mention Yönetici requirement
        print(f"Standard Admin correctly denied: {data['detail']}")
    
    def test_create_admin_by_super_admin(self, super_admin_token):
        """Test creating a new admin user by Yönetici"""
        test_email = "TEST_new_admin@herbalife.com"
        
        response = requests.post(f"{BASE_URL}/api/admins", 
            headers={"Authorization": f"Bearer {super_admin_token}"},
            json={
                "email": test_email,
                "password": "testpass123",
                "role": "Admin"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_email
        assert data["role"] == "Admin"
        assert "id" in data
        
        print(f"Created admin: {data['email']} with role: {data['role']}")
        
        # Cleanup - delete the test admin
        delete_response = requests.delete(
            f"{BASE_URL}/api/admins/{data['id']}",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        assert delete_response.status_code == 200
        print("Test admin cleaned up")
    
    def test_create_admin_forbidden_for_standard_admin(self, standard_admin_token):
        """Test creating admin is forbidden for standard Admin"""
        response = requests.post(f"{BASE_URL}/api/admins",
            headers={"Authorization": f"Bearer {standard_admin_token}"},
            json={
                "email": "TEST_forbidden@herbalife.com",
                "password": "testpass123",
                "role": "Admin"
            }
        )
        
        assert response.status_code == 403
        print("Standard Admin correctly denied from creating users")
    
    def test_update_admin_by_super_admin(self, super_admin_token):
        """Test updating an admin user by Yönetici"""
        # First create a test admin
        create_response = requests.post(f"{BASE_URL}/api/admins",
            headers={"Authorization": f"Bearer {super_admin_token}"},
            json={
                "email": "TEST_update_admin@herbalife.com",
                "password": "testpass123",
                "role": "Admin"
            }
        )
        assert create_response.status_code == 201
        admin_id = create_response.json()["id"]
        
        # Update the admin
        update_response = requests.put(
            f"{BASE_URL}/api/admins/{admin_id}",
            headers={"Authorization": f"Bearer {super_admin_token}"},
            json={"email": "TEST_updated_admin@herbalife.com"}
        )
        
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["email"] == "TEST_updated_admin@herbalife.com"
        print(f"Updated admin email to: {data['email']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admins/{admin_id}",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
    
    def test_delete_admin_by_super_admin(self, super_admin_token):
        """Test deleting an admin user by Yönetici"""
        # First create a test admin
        create_response = requests.post(f"{BASE_URL}/api/admins",
            headers={"Authorization": f"Bearer {super_admin_token}"},
            json={
                "email": "TEST_delete_admin@herbalife.com",
                "password": "testpass123",
                "role": "Admin"
            }
        )
        assert create_response.status_code == 201
        admin_id = create_response.json()["id"]
        
        # Delete the admin
        delete_response = requests.delete(
            f"{BASE_URL}/api/admins/{admin_id}",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        
        assert delete_response.status_code == 200
        data = delete_response.json()
        assert "message" in data
        print(f"Deleted admin: {data['message']}")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/admins",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        admins = get_response.json()
        admin_ids = [a["id"] for a in admins]
        assert admin_id not in admin_ids
        print("Verified admin was deleted")
    
    def test_delete_admin_forbidden_for_standard_admin(self, standard_admin_token, super_admin_token):
        """Test deleting admin is forbidden for standard Admin"""
        # Get list of admins to get an ID
        get_response = requests.get(f"{BASE_URL}/api/admins",
            headers={"Authorization": f"Bearer {super_admin_token}"}
        )
        admins = get_response.json()
        target_admin = next((a for a in admins if a["role"] == "Admin"), None)
        
        if target_admin:
            delete_response = requests.delete(
                f"{BASE_URL}/api/admins/{target_admin['id']}",
                headers={"Authorization": f"Bearer {standard_admin_token}"}
            )
            assert delete_response.status_code == 403
            print("Standard Admin correctly denied from deleting users")


class TestCardPaymentStatus:
    """Card payment status endpoint tests"""
    
    def test_card_payment_status_endpoint(self):
        """Test /api/card-payment/status returns correct structure"""
        response = requests.get(f"{BASE_URL}/api/card-payment/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "card_payment_enabled" in data
        assert "available_providers" in data
        assert isinstance(data["available_providers"], list)
        
        print(f"Card payment enabled: {data['card_payment_enabled']}")
        print(f"Available providers: {data['available_providers']}")
    
    def test_card_payment_providers_are_valid(self):
        """Test that available providers are valid (iyzico, paytr, or empty)"""
        response = requests.get(f"{BASE_URL}/api/card-payment/status")
        data = response.json()
        
        valid_providers = ["iyzico", "paytr"]
        for provider in data["available_providers"]:
            assert provider in valid_providers, f"Invalid provider: {provider}"
        
        print(f"All providers are valid: {data['available_providers']}")


class TestPaymentSettings:
    """Payment settings tests - includes Iyzico and PayTR options"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_payment_settings(self):
        """Test fetching payment settings"""
        response = requests.get(f"{BASE_URL}/api/payment-settings")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify EFT fields
        assert "account_holder_name" in data
        assert "iban" in data
        assert "bank_name" in data
        
        # Verify card payment fields
        assert "card_payment_enabled" in data
        assert "card_payment_provider" in data
        
        # Verify Iyzico fields
        assert "iyzico_api_key" in data
        assert "iyzico_secret_key" in data
        assert "iyzico_sandbox" in data
        
        # Verify PayTR fields
        assert "paytr_merchant_id" in data
        assert "paytr_merchant_key" in data
        assert "paytr_merchant_salt" in data
        assert "paytr_sandbox" in data
        
        print(f"Payment settings retrieved successfully")
        print(f"Card payment enabled: {data['card_payment_enabled']}")
        print(f"Card payment provider: {data['card_payment_provider']}")
    
    def test_update_payment_settings_with_iyzico(self, admin_token):
        """Test updating payment settings with Iyzico configuration"""
        # Get current settings first
        get_response = requests.get(f"{BASE_URL}/api/payment-settings")
        original_settings = get_response.json()
        
        # Update with Iyzico settings
        update_data = {
            "account_holder_name": original_settings["account_holder_name"],
            "iban": original_settings["iban"],
            "bank_name": original_settings.get("bank_name"),
            "card_payment_enabled": True,
            "card_payment_provider": "iyzico",
            "iyzico_api_key": "test_api_key",
            "iyzico_secret_key": "test_secret_key",
            "iyzico_sandbox": True
        }
        
        response = requests.put(f"{BASE_URL}/api/payment-settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=update_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["card_payment_enabled"] == True
        assert data["card_payment_provider"] == "iyzico"
        print("Payment settings updated with Iyzico configuration")
        
        # Restore original settings
        restore_data = {
            "account_holder_name": original_settings["account_holder_name"],
            "iban": original_settings["iban"],
            "bank_name": original_settings.get("bank_name"),
            "card_payment_enabled": original_settings.get("card_payment_enabled", False),
            "card_payment_provider": original_settings.get("card_payment_provider"),
            "iyzico_api_key": original_settings.get("iyzico_api_key"),
            "iyzico_secret_key": original_settings.get("iyzico_secret_key"),
            "iyzico_sandbox": original_settings.get("iyzico_sandbox", True),
            "paytr_merchant_id": original_settings.get("paytr_merchant_id"),
            "paytr_merchant_key": original_settings.get("paytr_merchant_key"),
            "paytr_merchant_salt": original_settings.get("paytr_merchant_salt"),
            "paytr_sandbox": original_settings.get("paytr_sandbox", True)
        }
        requests.put(f"{BASE_URL}/api/payment-settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=restore_data
        )
        print("Original settings restored")


class TestPaymentSettingsProviderOptions:
    """Test payment provider selection options"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_provider_can_be_iyzico(self, admin_token):
        """Test setting provider to iyzico only"""
        get_response = requests.get(f"{BASE_URL}/api/payment-settings")
        original = get_response.json()
        
        update_data = {
            "account_holder_name": original["account_holder_name"],
            "iban": original["iban"],
            "card_payment_enabled": True,
            "card_payment_provider": "iyzico"
        }
        
        response = requests.put(f"{BASE_URL}/api/payment-settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=update_data
        )
        
        assert response.status_code == 200
        assert response.json()["card_payment_provider"] == "iyzico"
        print("Provider set to iyzico successfully")
        
        # Restore
        requests.put(f"{BASE_URL}/api/payment-settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "account_holder_name": original["account_holder_name"],
                "iban": original["iban"],
                "card_payment_enabled": original.get("card_payment_enabled", False),
                "card_payment_provider": original.get("card_payment_provider")
            }
        )
    
    def test_provider_can_be_paytr(self, admin_token):
        """Test setting provider to paytr only"""
        get_response = requests.get(f"{BASE_URL}/api/payment-settings")
        original = get_response.json()
        
        update_data = {
            "account_holder_name": original["account_holder_name"],
            "iban": original["iban"],
            "card_payment_enabled": True,
            "card_payment_provider": "paytr"
        }
        
        response = requests.put(f"{BASE_URL}/api/payment-settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=update_data
        )
        
        assert response.status_code == 200
        assert response.json()["card_payment_provider"] == "paytr"
        print("Provider set to paytr successfully")
        
        # Restore
        requests.put(f"{BASE_URL}/api/payment-settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "account_holder_name": original["account_holder_name"],
                "iban": original["iban"],
                "card_payment_enabled": original.get("card_payment_enabled", False),
                "card_payment_provider": original.get("card_payment_provider")
            }
        )
    
    def test_provider_can_be_both(self, admin_token):
        """Test setting provider to both (iyzico and paytr)"""
        get_response = requests.get(f"{BASE_URL}/api/payment-settings")
        original = get_response.json()
        
        update_data = {
            "account_holder_name": original["account_holder_name"],
            "iban": original["iban"],
            "card_payment_enabled": True,
            "card_payment_provider": "both"
        }
        
        response = requests.put(f"{BASE_URL}/api/payment-settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=update_data
        )
        
        assert response.status_code == 200
        assert response.json()["card_payment_provider"] == "both"
        print("Provider set to both successfully")
        
        # Restore
        requests.put(f"{BASE_URL}/api/payment-settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "account_holder_name": original["account_holder_name"],
                "iban": original["iban"],
                "card_payment_enabled": original.get("card_payment_enabled", False),
                "card_payment_provider": original.get("card_payment_provider")
            }
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
