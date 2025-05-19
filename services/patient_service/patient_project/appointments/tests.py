from django.test import TestCase

class DummyTestCase(TestCase):
    def test_something(self):
        self.assertEqual(1, 1)