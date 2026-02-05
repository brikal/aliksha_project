
# Single source of truth for collections with metadata
COLLECTIONS = [
    {
        'slug': 'cotton-sarees',
        'name': 'Cotton Sarees',
        'image': 'images/white_cotton_saree.jpg'
    },
    {
        'slug': 'bandhani-sarees',
        'name': 'Bandhani Sarees',
        'image': 'images/red_cotton_saree.jpg'
    },
    {
        'slug': 'ajrakh-sarees',
        'name': 'Ajrakh Sarees',
        'image': 'images/green_ajrakh.png'
    },
    {
        'slug': 'banarasi-sarees',
        'name': 'Banarasi Sarees',
        'image': 'images/Gemini_red_saree.png'
    },
    {
        'slug': 'contemporary-ethnic',
        'name': 'Contemporary Ethnic',
        'image': 'images/black_ajrakh.png'
    },
    {
        'slug': 'bandhani-dresses',
        'name': 'Bandhani Dresses',
        'image': 'images/blue_bandhani.png'
    },
    {
        'slug': 'batik-dresses',
        'name': 'Batik Dresses',
        'image': 'images/brown_bandhani.png'
    }
]

# Backward compatibility alias
COLLECTION_NAMES = COLLECTIONS

def footer_collections(request):
    """
    Context processor to make collection data available globally.
    """
    return {
        'footer_collections': COLLECTIONS
    }
