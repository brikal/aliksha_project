from django.contrib import admin
from django.urls import path
from core.views import home, about, contact, new_collections, search, collections_view, all_collections # type: ignore
from core.views import login_view, signup_view, logout_view # type: ignore
from products.views import product_detail # type: ignore
from cart.views import add_to_cart, view_cart, remove_from_cart # type: ignore
from orders.views import checkout

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    path('about/', about, name='about'),
    path('contact/', contact, name='contact'),
    path('all-collections/', all_collections, name='all_collections'),
    path('new-collections/', new_collections, name='new_collections'),
    path('search/', search, name='search'),
    path('collections/<str:collection_slug>/', collections_view, name='collections'),
    path('auth/login/', login_view, name='login_api'),
    path('auth/signup/', signup_view, name='signup_api'),
    path('auth/logout/', logout_view, name='logout'),
    path('product/<int:id>/', product_detail, name='product_detail'),
    path('add-to-cart/<int:product_id>/', add_to_cart, name='add_to_cart'),
    path('cart/', view_cart, name='view_cart'),
    path('remove-from-cart/<int:product_id>/', remove_from_cart, name='remove_from_cart'),
    path('checkout/', checkout, name='checkout'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)