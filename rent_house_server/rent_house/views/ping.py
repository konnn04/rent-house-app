from django.http import JsonResponse
import time
from datetime import datetime

def ping_view(request):
    start_time = time.time()
    
    end_time = time.time()
    latency_ms = (end_time - start_time) * 1000  
    
    response_data = {
        "message": "pong",
        "latency_ms": round(latency_ms, 2),
        "timestamp": datetime.now().isoformat()
    }
    
    return JsonResponse(response_data)