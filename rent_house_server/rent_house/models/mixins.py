from django.db import models
from django.utils import timezone

class SoftDeleteModelMixin(models.Model):
    is_active = models.BooleanField(default=True, db_index=True, help_text="Còn hoạt động hay không")
    deleted_at = models.DateTimeField(null=True, blank=True, help_text="Thời điểm xóa")
    
    class Meta:
        abstract = True
    
    def delete(self, *args, **kwargs):
        hard_delete = kwargs.pop('hard_delete', False)
        if hard_delete:
            return super().delete(*args, **kwargs)
            
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_active', 'deleted_at'])
        
    def restore(self):
        self.is_active = True
        self.deleted_at = None
        self.save(update_fields=['is_active', 'deleted_at'])