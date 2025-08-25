from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, EventSerializer
from .models import User, Event
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_public_events(request):
    events = Event.objects.filter(is_private=False)
    serialized_events = [{'id': e.id, 'title': e.title, 'date': e.date.isoformat()} for e in events]
    return Response({'events': serialized_events})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "Vous êtes authentifié !", "user_id": request.user.id, "role": request.user.role}, status=200)

@api_view(['GET'])
def test_view(request):
    return Response({"message": "Test API fonctionne"}, status=200)

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Utilisateur créé"}, status=status.HTTP_201_CREATED)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user_id": user.id,
                "role": user.role
            }, status=status.HTTP_200_OK)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_event(request):
    user = request.user
    if user.role != 'organisateur':
        return Response({"error": "Seuls les organisateurs peuvent créer des événements."}, status=status.HTTP_403_FORBIDDEN)
    serializer = EventSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(organizer=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_event(request, event_id):
    user = request.user
    event = get_object_or_404(Event, id=event_id)
    if user.role != 'organisateur' or event.organizer != user:
        return Response({"error": "Vous n'êtes pas autorisé à modifier cet événement."}, status=status.HTTP_403_FORBIDDEN)
    serializer = EventSerializer(event, data=request.data, partial=True)  # partial=True pour mises à jour partielles
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_event(request, event_id):
    user = request.user
    event = get_object_or_404(Event, id=event_id)
    if user.role != 'organisateur' or event.organizer != user:
        return Response({"error": "Vous n'êtes pas autorisé à supprimer cet événement."}, status=status.HTTP_403_FORBIDDEN)
    event.delete()
    return Response({"message": "Événement supprimé avec succès."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_organizer_events(request):
    user = request.user
    if user.role != 'organisateur':
        return Response({"error": "Seuls les organisateurs peuvent voir leurs événements."}, status=status.HTTP_403_FORBIDDEN)
    events = Event.objects.filter(organizer=user)
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)