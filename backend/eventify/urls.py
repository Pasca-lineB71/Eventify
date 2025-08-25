from django.contrib import admin
from django.urls import path
from core.views import test_view, RegisterView, LoginView, protected_view, list_public_events, create_event, update_event, delete_event, list_organizer_events
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/test/', test_view, name="test_api"),
    path('api/register/', RegisterView.as_view(), name="register"),
    path('api/login/', LoginView.as_view(), name="login"),
    path('api/protected/', protected_view, name="protected"),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/list-public-events/', list_public_events, name="list_public_events"),
    path('api/create-event/', create_event, name="create_event"),
    path('api/update-event/<int:event_id>/', update_event, name="update_event"),
    path('api/delete-event/<int:event_id>/', delete_event, name="delete_event"),
    path('api/list-organizer-events/', list_organizer_events, name="list_organizer_events"),
]