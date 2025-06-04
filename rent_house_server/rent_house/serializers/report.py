from rest_framework import serializers
from rent_house.models import Report, ReportType

class ReportSerializer(serializers.ModelSerializer):
    reporter = serializers.HiddenField(default=serializers.CurrentUserDefault())
    type_display = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reported_user', 'type', 'type_display', 'reason', 'is_resolved', 'created_at']
        read_only_fields = ['id', 'is_resolved', 'created_at', 'type_display']

    def get_type_display(self, obj):
        return obj.get_type_display()