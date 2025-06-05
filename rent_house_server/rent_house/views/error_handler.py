from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None and response.status_code == 401:
        response.data = {
            'message': 'Vui lòng đăng nhập để truy cập API này',
            'error': 'unauthorized',
            'status_code': 401
        }
    
    return response