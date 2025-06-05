from rest_framework import viewsets, permissions, mixins
from rest_framework.response import Response
from rent_house.models import Report
from rent_house.serializers.report import ReportSerializer

# Chỉ tạo
class ReportViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
