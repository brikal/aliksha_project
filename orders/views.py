from django.shortcuts import render, redirect
from .models import Order, OrderItem
from products.models import Product

def checkout(request):
    cart = request.session.get('cart', {})

    if not cart:
        return redirect('view_cart')

    if request.method == "POST":
        name = request.POST.get('name')
        phone = request.POST.get('phone')
        address = request.POST.get('address')

        # Create Order
        order = Order.objects.create(
            name=name,
            phone=phone,
            address=address
        )
    
        # Create OrderItems
        for product_id, quantity in cart.items():
            product = Product.objects.get(id=product_id)

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )

        # Clear cart
        request.session['cart'] = {}

        return render(request, 'order_success.html', {'order': order})

    return render(request, 'checkout.html')