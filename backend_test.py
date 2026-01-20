#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class HerbalifeAPITester:
    def __init__(self, base_url="https://nutri-cart-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_resources = {
            'products': [],
            'videos': [],
            'banners': [],
            'orders': [],
            'testimonials': []
        }

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            
        result = {
            'test_name': name,
            'success': success,
            'details': details,
            'response_data': response_data,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, auth_required: bool = False) -> tuple[bool, Any]:
        """Make HTTP request and return success status and response data"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = response.text

            if not success:
                return False, f"Expected {expected_status}, got {response.status_code}: {response_data}"
            
            return True, response_data

        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}"

    def test_admin_auth(self):
        """Test admin authentication"""
        print("\n🔐 Testing Admin Authentication...")
        
        # Test admin login with provided credentials
        login_data = {
            "email": "admin@herbalife.com",
            "password": "admin123"
        }
        
        success, response = self.make_request('POST', 'auth/login', login_data)
        
        if success and 'token' in response:
            self.token = response['token']
            self.log_test("Admin Login", True, f"Token received: {self.token[:20]}...")
            return True
        else:
            self.log_test("Admin Login", False, f"Login failed: {response}")
            return False

    def test_products_api(self):
        """Test products CRUD operations"""
        print("\n📦 Testing Products API...")
        
        # Test GET products (public)
        success, response = self.make_request('GET', 'products')
        self.log_test("Get Products (Public)", success, f"Found {len(response) if success else 0} products")
        
        if not self.token:
            self.log_test("Products CRUD", False, "No admin token available")
            return
            
        # Test CREATE product
        product_data = {
            "name": "Test Protein Shake",
            "description": "High-quality protein shake for fitness enthusiasts",
            "price": 299.99,
            "image_url": "https://images.unsplash.com/photo-1582793908165-4cb4c8e4ef84",
            "category": "Protein",
            "stock": 50,
            "is_package": False
        }
        
        success, response = self.make_request('POST', 'products', product_data, 200, True)
        if success:
            product_id = response['id']
            self.created_resources['products'].append(product_id)
            self.log_test("Create Product", True, f"Product created with ID: {product_id}")
            
            # Test GET single product
            success, response = self.make_request('GET', f'products/{product_id}')
            self.log_test("Get Single Product", success, f"Retrieved product: {response.get('name', 'Unknown') if success else 'Failed'}")
            
            # Test UPDATE product
            update_data = {"price": 349.99, "stock": 45}
            success, response = self.make_request('PUT', f'products/{product_id}', update_data, auth_required=True)
            self.log_test("Update Product", success, f"Updated price to {response.get('price', 'Unknown') if success else 'Failed'}")
            
        else:
            self.log_test("Create Product", False, f"Failed to create product: {response}")

    def test_videos_api(self):
        """Test videos CRUD operations"""
        print("\n🎥 Testing Videos API...")
        
        # Test GET videos (public)
        success, response = self.make_request('GET', 'videos')
        self.log_test("Get Videos (Public)", success, f"Found {len(response) if success else 0} videos")
        
        if not self.token:
            return
            
        # Test CREATE video
        video_data = {
            "title": "Herbalife Nutrition Benefits",
            "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "order": 1,
            "active": True
        }
        
        success, response = self.make_request('POST', 'videos', video_data, 200, True)
        if success:
            video_id = response['id']
            self.created_resources['videos'].append(video_id)
            self.log_test("Create Video", True, f"Video created with ID: {video_id}")
            
            # Test UPDATE video
            update_data = {"title": "Updated Video Title", "order": 2}
            success, response = self.make_request('PUT', f'videos/{video_id}', update_data, auth_required=True)
            self.log_test("Update Video", success, f"Updated video title" if success else "Failed to update")
        else:
            self.log_test("Create Video", False, f"Failed to create video: {response}")

    def test_banners_api(self):
        """Test banners CRUD operations"""
        print("\n🖼️ Testing Banners API...")
        
        # Test GET banners (public)
        success, response = self.make_request('GET', 'banners')
        self.log_test("Get Banners (Public)", success, f"Found {len(response) if success else 0} banners")
        
        if not self.token:
            return
            
        # Test CREATE banner
        banner_data = {
            "title": "Summer Sale Campaign",
            "description": "Get 30% off on all products",
            "image_url": "https://images.unsplash.com/photo-1722392307113-b774bd5c0079",
            "link_url": "https://example.com/sale",
            "active": True
        }
        
        success, response = self.make_request('POST', 'banners', banner_data, 200, True)
        if success:
            banner_id = response['id']
            self.created_resources['banners'].append(banner_id)
            self.log_test("Create Banner", True, f"Banner created with ID: {banner_id}")
            
            # Test UPDATE banner
            update_data = {"title": "Updated Summer Sale", "active": False}
            success, response = self.make_request('PUT', f'banners/{banner_id}', update_data, auth_required=True)
            self.log_test("Update Banner", success, f"Updated banner" if success else "Failed to update")
        else:
            self.log_test("Create Banner", False, f"Failed to create banner: {response}")

    def test_testimonials_api(self):
        """Test testimonials CRUD operations"""
        print("\n💬 Testing Testimonials API...")
        
        # Test GET testimonials (public)
        success, response = self.make_request('GET', 'testimonials')
        self.log_test("Get Testimonials (Public)", success, f"Found {len(response) if success else 0} testimonials")
        
        if not self.token:
            return
            
        # Test CREATE testimonial
        testimonial_data = {
            "customer_name": "Ahmet Yılmaz",
            "customer_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
            "rating": 5,
            "comment": "Herbalife ürünleri sayesinde hedefime ulaştım. Harika kalite!",
            "active": True
        }
        
        success, response = self.make_request('POST', 'testimonials', testimonial_data, 200, True)
        if success:
            testimonial_id = response['id']
            self.created_resources['testimonials'].append(testimonial_id)
            self.log_test("Create Testimonial", True, f"Testimonial created with ID: {testimonial_id}")
            
            # Test UPDATE testimonial
            update_data = {"rating": 4, "comment": "Updated comment - still great products!"}
            success, response = self.make_request('PUT', f'testimonials/{testimonial_id}', update_data, auth_required=True)
            self.log_test("Update Testimonial", success, f"Updated testimonial" if success else "Failed to update")
        else:
            self.log_test("Create Testimonial", False, f"Failed to create testimonial: {response}")

    def test_orders_api(self):
        """Test orders API"""
        print("\n🛒 Testing Orders API...")
        
        # Test CREATE order (public endpoint)
        order_data = {
            "customer_name": "Test Müşteri",
            "customer_email": "test@example.com",
            "customer_phone": "+90 555 123 45 67",
            "customer_address": "Test Mahallesi, Test Sokak No:1, Test İlçe, İstanbul",
            "customer_iban": "TR00 0000 0000 0000 0000 0000 00",
            "items": [
                {
                    "product_id": "test-product-1",
                    "product_name": "Test Product",
                    "quantity": 2,
                    "price": 299.99
                }
            ],
            "total_amount": 599.98
        }
        
        success, response = self.make_request('POST', 'orders', order_data, 200)
        if success:
            order_id = response['id']
            self.created_resources['orders'].append(order_id)
            self.log_test("Create Order", True, f"Order created with ID: {order_id}")
            
            # Test GET single order (public)
            success, response = self.make_request('GET', f'orders/{order_id}')
            self.log_test("Get Single Order", success, f"Retrieved order for: {response.get('customer_name', 'Unknown') if success else 'Failed'}")
            
            # Test GET all orders (admin only)
            if self.token:
                success, response = self.make_request('GET', 'orders', auth_required=True)
                self.log_test("Get All Orders (Admin)", success, f"Found {len(response) if success else 0} orders")
                
                # Test UPDATE order status (admin only)
                update_data = {"status": "confirmed"}
                success, response = self.make_request('PUT', f'orders/{order_id}', update_data, auth_required=True)
                self.log_test("Update Order Status", success, f"Updated status to: {response.get('status', 'Unknown') if success else 'Failed'}")
        else:
            self.log_test("Create Order", False, f"Failed to create order: {response}")

    def cleanup_resources(self):
        """Clean up created test resources"""
        print("\n🧹 Cleaning up test resources...")
        
        if not self.token:
            print("No admin token available for cleanup")
            return
            
        cleanup_count = 0
        
        # Delete created products
        for product_id in self.created_resources['products']:
            success, _ = self.make_request('DELETE', f'products/{product_id}', auth_required=True, expected_status=200)
            if success:
                cleanup_count += 1
                
        # Delete created videos
        for video_id in self.created_resources['videos']:
            success, _ = self.make_request('DELETE', f'videos/{video_id}', auth_required=True, expected_status=200)
            if success:
                cleanup_count += 1
                
        # Delete created banners
        for banner_id in self.created_resources['banners']:
            success, _ = self.make_request('DELETE', f'banners/{banner_id}', auth_required=True, expected_status=200)
            if success:
                cleanup_count += 1
                
        # Delete created testimonials
        for testimonial_id in self.created_resources['testimonials']:
            success, _ = self.make_request('DELETE', f'testimonials/{testimonial_id}', auth_required=True, expected_status=200)
            if success:
                cleanup_count += 1
                
        print(f"Cleaned up {cleanup_count} test resources")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Herbalife E-commerce API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test authentication first
        auth_success = self.test_admin_auth()
        
        # Run all API tests
        self.test_products_api()
        self.test_videos_api()
        self.test_banners_api()
        self.test_testimonials_api()
        self.test_orders_api()
        
        # Cleanup
        self.cleanup_resources()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        # Return results for further processing
        return {
            'total_tests': self.tests_run,
            'passed_tests': self.tests_passed,
            'failed_tests': self.tests_run - self.tests_passed,
            'success_rate': self.tests_passed / self.tests_run * 100 if self.tests_run > 0 else 0,
            'test_results': self.test_results,
            'auth_success': auth_success
        }

def main():
    tester = HerbalifeAPITester()
    results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if results['failed_tests'] > 0:
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())