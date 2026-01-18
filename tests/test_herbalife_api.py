"""
Herbalife E-commerce API Tests
Tests for: Site Settings, Products with Variants, Out-of-Stock functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSiteSettings:
    """Site Settings API tests - TopBar and Footer content"""
    
    def test_get_site_settings(self):
        """Test fetching site settings including topbar_message and footer fields"""
        response = requests.get(f"{BASE_URL}/api/site-settings")
        assert response.status_code == 200
        
        data = response.json()
        # Verify all required fields exist
        assert "topbar_message" in data
        assert "footer_about" in data
        assert "footer_phone" in data
        assert "footer_email" in data
        assert "logo_url" in data
        
        # Verify topbar message is set
        assert data["topbar_message"] == "🚚 Kargo Ücretsizdir!"
        print(f"TopBar message: {data['topbar_message']}")
        print(f"Footer about: {data['footer_about']}")
        print(f"Footer phone: {data['footer_phone']}")
        print(f"Footer email: {data['footer_email']}")


class TestProducts:
    """Product API tests including variants and stock availability"""
    
    def test_get_all_products(self):
        """Test fetching all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Total products: {len(data)}")
        
    def test_products_have_variant_fields(self):
        """Test that products have has_variants and variants fields"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        data = response.json()
        for product in data:
            assert "has_variants" in product
            assert "variants" in product
            if product["has_variants"]:
                assert isinstance(product["variants"], list)
                for variant in product["variants"]:
                    assert "name" in variant
                    assert "is_available" in variant
                    assert "stock" in variant
                    print(f"Product: {product['name']}, Variant: {variant['name']}, Available: {variant['is_available']}, Stock: {variant['stock']}")
    
    def test_get_single_product(self):
        """Test fetching a single product by ID"""
        # First get all products
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        
        if len(products) > 0:
            product_id = products[0]["id"]
            response = requests.get(f"{BASE_URL}/api/products/{product_id}")
            assert response.status_code == 200
            
            data = response.json()
            assert data["id"] == product_id
            print(f"Fetched product: {data['name']}")


class TestAuthentication:
    """Admin authentication tests"""
    
    def test_admin_login(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@herbalife.com",
            "password": "admin123"
        })
        
        # If admin exists, should return 200 with token
        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            print("Admin login successful")
            return data["token"]
        else:
            # Admin might not exist, try to register
            print(f"Login failed with status {response.status_code}, attempting registration")
            return None
    
    def test_admin_register_and_login(self):
        """Test admin registration and login flow"""
        # Try to register a test admin
        test_email = "test_admin@herbalife.com"
        test_password = "testpass123"
        
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": test_password
        })
        
        # Either 201 (created) or 400 (already exists) is acceptable
        assert register_response.status_code in [200, 201, 400]
        
        # Now try to login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        
        assert login_response.status_code == 200
        data = login_response.json()
        assert "token" in data
        print(f"Test admin authenticated successfully")


class TestProductVariantsAvailability:
    """Tests for product variant availability (out-of-stock feature)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for admin operations"""
        # Try existing admin first
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@herbalife.com",
            "password": "admin123"
        })
        
        if response.status_code == 200:
            return response.json()["token"]
        
        # Try test admin
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_admin@herbalife.com",
            "password": "testpass123"
        })
        
        if response.status_code == 200:
            return response.json()["token"]
        
        pytest.skip("No admin credentials available")
    
    def test_create_product_with_unavailable_variants(self, auth_token):
        """Test creating a product with some variants marked as unavailable"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a test product with mixed availability variants
        test_product = {
            "name": "TEST_OutOfStock_Product",
            "description": "Test product for out-of-stock feature",
            "price": 99.99,
            "image_url": "https://via.placeholder.com/300",
            "category": "Test",
            "stock": 100,
            "is_package": False,
            "has_variants": True,
            "variants": [
                {"name": "Available Variant", "stock": 50, "is_available": True},
                {"name": "Out of Stock Variant", "stock": 0, "is_available": False}
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/products", json=test_product, headers=headers)
        assert response.status_code in [200, 201]
        
        data = response.json()
        assert data["has_variants"] == True
        assert len(data["variants"]) == 2
        
        # Verify variant availability
        available_variant = next((v for v in data["variants"] if v["name"] == "Available Variant"), None)
        unavailable_variant = next((v for v in data["variants"] if v["name"] == "Out of Stock Variant"), None)
        
        assert available_variant is not None
        assert available_variant["is_available"] == True
        
        assert unavailable_variant is not None
        assert unavailable_variant["is_available"] == False
        
        print(f"Created test product with ID: {data['id']}")
        print(f"Available variant: {available_variant}")
        print(f"Unavailable variant: {unavailable_variant}")
        
        # Cleanup - delete the test product
        delete_response = requests.delete(f"{BASE_URL}/api/products/{data['id']}", headers=headers)
        assert delete_response.status_code == 200
        print("Test product cleaned up")
    
    def test_create_product_all_variants_unavailable(self, auth_token):
        """Test creating a product where ALL variants are unavailable (should show TÜKENDİ badge)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        test_product = {
            "name": "TEST_AllUnavailable_Product",
            "description": "Test product with all variants out of stock",
            "price": 149.99,
            "image_url": "https://via.placeholder.com/300",
            "category": "Test",
            "stock": 0,
            "is_package": False,
            "has_variants": True,
            "variants": [
                {"name": "Variant A", "stock": 0, "is_available": False},
                {"name": "Variant B", "stock": 0, "is_available": False}
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/products", json=test_product, headers=headers)
        assert response.status_code in [200, 201]
        
        data = response.json()
        
        # Verify all variants are unavailable
        for variant in data["variants"]:
            assert variant["is_available"] == False
            print(f"Variant '{variant['name']}' is_available: {variant['is_available']}")
        
        # Cleanup
        delete_response = requests.delete(f"{BASE_URL}/api/products/{data['id']}", headers=headers)
        assert delete_response.status_code == 200
        print("Test product cleaned up")
    
    def test_update_variant_availability(self, auth_token):
        """Test updating a product's variant availability"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a product first
        test_product = {
            "name": "TEST_UpdateVariant_Product",
            "description": "Test product for updating variant availability",
            "price": 79.99,
            "image_url": "https://via.placeholder.com/300",
            "category": "Test",
            "stock": 100,
            "is_package": False,
            "has_variants": True,
            "variants": [
                {"name": "Variant 1", "stock": 50, "is_available": True}
            ]
        }
        
        create_response = requests.post(f"{BASE_URL}/api/products", json=test_product, headers=headers)
        assert create_response.status_code in [200, 201]
        product_id = create_response.json()["id"]
        
        # Update the variant to be unavailable
        update_data = {
            "variants": [
                {"name": "Variant 1", "stock": 0, "is_available": False}
            ]
        }
        
        update_response = requests.put(f"{BASE_URL}/api/products/{product_id}", json=update_data, headers=headers)
        assert update_response.status_code == 200
        
        updated_data = update_response.json()
        assert updated_data["variants"][0]["is_available"] == False
        print(f"Updated variant availability to: {updated_data['variants'][0]['is_available']}")
        
        # Cleanup
        delete_response = requests.delete(f"{BASE_URL}/api/products/{product_id}", headers=headers)
        assert delete_response.status_code == 200
        print("Test product cleaned up")


class TestSiteSettingsUpdate:
    """Tests for updating site settings (admin only)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for admin operations"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@herbalife.com",
            "password": "admin123"
        })
        
        if response.status_code == 200:
            return response.json()["token"]
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_admin@herbalife.com",
            "password": "testpass123"
        })
        
        if response.status_code == 200:
            return response.json()["token"]
        
        pytest.skip("No admin credentials available")
    
    def test_update_site_settings(self, auth_token):
        """Test updating site settings including topbar and footer"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get current settings first
        get_response = requests.get(f"{BASE_URL}/api/site-settings")
        assert get_response.status_code == 200
        original_settings = get_response.json()
        
        # Update settings
        update_data = {
            "logo_url": original_settings["logo_url"],
            "topbar_message": "🚚 Test Kargo Mesajı!",
            "footer_about": "Test Footer About",
            "footer_phone": "+90 555 555 5555",
            "footer_email": "test@test.com"
        }
        
        update_response = requests.put(f"{BASE_URL}/api/site-settings", json=update_data, headers=headers)
        assert update_response.status_code == 200
        
        updated_data = update_response.json()
        assert updated_data["topbar_message"] == "🚚 Test Kargo Mesajı!"
        assert updated_data["footer_about"] == "Test Footer About"
        print("Site settings updated successfully")
        
        # Restore original settings
        restore_data = {
            "logo_url": original_settings["logo_url"],
            "topbar_message": original_settings.get("topbar_message", "🚚 Kargo Ücretsizdir!"),
            "footer_about": original_settings.get("footer_about", "Sağlıklı yaşamınız için doğru adres"),
            "footer_phone": original_settings.get("footer_phone", "+90 542 140 07 55"),
            "footer_email": original_settings.get("footer_email", "info@herbalife.com")
        }
        
        restore_response = requests.put(f"{BASE_URL}/api/site-settings", json=restore_data, headers=headers)
        assert restore_response.status_code == 200
        print("Original settings restored")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
