import json
import pytest
from unittest.mock import patch

from app import app  # assuming your Flask app is in app.py

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_signup_validation(client):
    # too-short username
    resp = client.post('/api/signup', json={'username': 'ab', 'password': 'secret', 'email': 'x@x.com'})
    assert resp.status_code == 400
    assert b"Username must be at least 3 characters" in resp.data

    # too-short password
    resp = client.post('/api/signup', json={'username': 'validuser', 'password': '123', 'email': 'x@x.com'})
    assert resp.status_code == 400
    assert b"Password must be at least 6 characters" in resp.data

@patch('app.create_user')
def test_signup_success(mock_create_user, client):
    mock_create_user.return_value = (42, None)
    payload = {'username': 'testuser', 'password': 'strongpass', 'email': 't@t.com'}
    resp = client.post('/api/signup', json=payload)
    data = resp.get_json()
    assert resp.status_code == 200
    assert data['success'] is True
    assert data['user_id'] == 42

@patch('app.authenticate_user')
def test_login_success_and_failure(mock_auth, client):
    # failure
    mock_auth.return_value = (None, False)
    resp = client.post('/api/login', json={'username': 'x', 'password': 'y'})
    assert resp.status_code == 401

    # success
    mock_auth.return_value = (7, True)
    resp = client.post('/api/login', json={'username': 'u', 'password': 'p'})
    data = resp.get_json()
    assert resp.status_code == 200
    assert data == {'success': True, 'user_id': 7, 'profile_completed': True}

@patch('app.search_food_autocomplete')
@patch('app.get_user_custom_foods')
def test_search_food_autocomplete(mock_custom, mock_autocomplete, client):
    mock_autocomplete.return_value = [
        {'name': 'Apple', 'source': 'usda', 'serving': '1 medium'},
    ]
    mock_custom.return_value = [{'name': 'My Salad', 'serving': '1 bowl'}]

    resp = client.post('/api/search_food_autocomplete', json={'query': 'ap', 'user_id': 5})
    assert resp.status_code == 200
    data = resp.get_json()
    # custom should come first
    assert data[0]['name'] == 'My Salad'
    assert any(item['name']=='Apple' for item in data)

@patch('app.add_food_to_current_meal')
@patch('app.ensure_user_exists')
def test_add_food_to_meal_missing_fields(mock_ensure, mock_add, client):
    resp = client.post('/api/add_food_to_meal', json={})
    assert resp.status_code == 400

@patch('app.add_food_to_current_meal')
@patch('app.ensure_user_exists')
def test_add_food_to_meal_success(mock_ensure, mock_add, client):
    payload = {
        'user_id': 10,
        'meal_type': 'lunch',
        'food_data': {'name': 'Toast', 'calories': 100}
    }
    resp = client.post('/api/add_food_to_meal', json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
    mock_ensure.assert_called_with(10)
    mock_add.assert_called_with(10, 'lunch', payload['food_data'])
