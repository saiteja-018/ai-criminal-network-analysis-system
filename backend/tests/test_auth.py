from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

class AuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='Password@123',
            role='INVESTIGATOR'
        )

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'Password@123'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_login_failure(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'WrongPassword'
        }, format='json')
        self.assertEqual(response.status_code, 401)
