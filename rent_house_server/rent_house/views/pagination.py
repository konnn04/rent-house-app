from rest_framework.pagination import PageNumberPagination

# Custom pagination class for smaller page sizes
class SmallPagePagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 20
