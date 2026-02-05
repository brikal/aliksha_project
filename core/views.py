from django.shortcuts import render, redirect
from django.db import models
from products.models import Product # type: ignore
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.http import JsonResponse
import json
from .context_processors import COLLECTIONS

User = get_user_model()

def home(request):
    return render(request, 'home.html')

def about(request):
    return render(request, 'about.html')

def contact(request):
    success = False

    if request.method == "POST":
        success = True

    return render(request, 'contact.html', {'success': success})

def new_collections(request):
    products = Product.objects.all()
    return render(request, 'new_collections.html', {'products': products})

def all_collections(request):
    return render(request, 'all_collections.html')

def search(request):
    from django.http import JsonResponse
    query = request.GET.get('q', '').strip()
    
    if len(query) < 2:
        return JsonResponse([], safe=False)
    
    # Search products by name or description
    products = Product.objects.filter(
        models.Q(name__icontains=query) | models.Q(description__icontains=query)
    )[:10]  # Limit to 10 results
    
    results = []
    for product in products:
        results.append({
            'id': product.id,
            'name': product.name,
            'price': str(product.price),
            'image': product.image.url if product.image else ''
        })
    
    return JsonResponse(results, safe=False)


def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'POST required'}, status=405)

    try:
        data = json.loads(request.body.decode())
    except Exception:
        data = request.POST

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'success': True})
    return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=400)


def signup_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'POST required'}, status=405)

    try:
        data = json.loads(request.body.decode())
    except Exception:
        data = request.POST

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return JsonResponse({'success': False, 'error': 'Username and password required'}, status=400)

    try:
        user = User.objects.create_user(username=username, password=password)
        user.save()
        # Auto-login after signup
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

def logout_view(request):
    logout(request)
    return redirect('home')

def collections_view(request, collection_slug):
    # Generate mock products for each collection (using default image)
    # In production, you'd filter products by collection
    products = []
    for i in range(12):  # 12 products per collection
        products.append({
            'id': i + 1,
            'name': f'{collection_slug.replace("-", " ").title()} Product {i + 1}',
            'price': 500 + (i * 50),
            'image': 'products/Gemini_red_saree.png'
        })
    
    # Find collection name from global list
    collection_name = collection_slug.replace('-', ' ').title()
    for col in COLLECTIONS:
        if col['slug'] == collection_slug:
            collection_name = col['name']
            break
    
    return render(request, 'collections.html', {
        'products': products,
        'collection_name': collection_name,
        'collection_slug': collection_slug
    })