from django.utils.translation import gettext_lazy as _
from django.urls import reverse_lazy
from pathlib import Path
from dotenv import load_dotenv
import os
import pymysql
from django.templatetags.static import static

pymysql.install_as_MySQLdb()

load_dotenv()

DEBUG = True

# Cloundinary
import cloudinary
cloudinary.config( 
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME', ''),
    api_key = os.getenv('CLOUDINARY_API_KEY', ''),
    api_secret = os.getenv('CLOUDINARY_API_SECRET', '')
)

BASE_DIR = Path(__file__).resolve().parent.parent
APPEND_SLASH = True

SECRET_KEY = 'django-insecure-w5g$n@c%sz5kxf!f00h+a9@4ac8i-va^5^a1a8hom$ad*l%c_y'

ALLOWED_HOSTS = [
    'localhost',
    '*',
]


INSTALLED_APPS = [
    "unfold",  # before django.contrib.admin
    "unfold.contrib.filters",  # optional, if special filters are needed
    "unfold.contrib.forms",  # optional, if special form elements are needed
    "unfold.contrib.inlines",  # optional, if special inlines are needed
    "unfold.contrib.import_export",  # optional, if django-import-export package is used
    "unfold.contrib.guardian",  # optional, if django-guardian package is used
    "unfold.contrib.simple_history",  # optional, if django-simple-history package is used
    "crispy_forms",
    "clearcache",
    #=====================
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'debug_toolbar',
    'rent_house',
    'ckeditor',
    'ckeditor_uploader',
    'rest_framework',
    'drf_yasg',
    'oauth2_provider',
]

OAUTH2_PROVIDER = { 
    'ERROR_RESPONSE_WITH_SCOPES': True,
    'OAUTH2_BACKEND_CLASS': 'oauth2_provider.oauth2_backends.JSONOAuthLibCore',
    'OAUTH2_VALIDATOR_CLASS': 'rent_house.auth_validators.CustomOAuth2Validator'
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'EXCEPTION_HANDLER': 'rent_house.views.error_handler.custom_exception_handler',
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '10/secord',
        'anon': '100/day',
    }
}

AUTH_USER_MODEL = 'rent_house.User'
CKEDITOR_UPLOAD_PATH = "ckeditors/"

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware'
]

ROOT_URLCONF = 'rent_house_server.urls'
MEDIA_ROOT = '%s/rent_house/static_media/' % BASE_DIR
STATIC_URL = '/static/'
STATIC_ROOT = '%s/rent_house/static/' % BASE_DIR
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'rent_house', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                
            ],
        },
    },
]

WSGI_APPLICATION = 'rent_house_server.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME') or 'rent_house',
        'USER': os.getenv('DB_USER') or 'root',
        'PASSWORD': os.getenv('DB_PASSWORD') or '1212',
        'HOST': os.getenv('DB_HOST') or 'localhost',
        'PORT': os.getenv('DB_PORT') or '3306',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'vi-vn'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'debug.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
        },
        'rent_house': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Telegram
TELEGRAM_DEBUG_ENABLED = os.getenv('TELEGRAM_DEBUG_ENABLED', 'False').lower() == 'true'
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '')
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')

# Email 
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '') 
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '') 
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)

VERIFICATION_CODE_EXPIRY_MINUTES = 30  

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

if TELEGRAM_DEBUG_ENABLED:
    LOGGING['handlers']['telegram'] = {
        'level': 'ERROR', 
        'class': 'rent_house.log_handlers.TelegramLogHandler',
    }
    LOGGING['loggers']['django']['handlers'].append('telegram')
    LOGGING['loggers']['rent_house']['handlers'].append('telegram')

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'https://*.ngrok-free.app',
    'https://light-mudfish-primary.ngrok-free.app',
    'https://djan.konnn04.live'
]

DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600 

UNFOLD = {
    "SITE_TITLE": "Quản trị Rent House",
    "SITE_HEADER": "Quản trị Rent House",
    "SHOW_HISTORY": False,
    "DASHBOARD_CALLBACK": "rent_house.admin_view.dashboard_callback",
    "SITE_URL": "/",
    "SITE_ICON": {
        "light": lambda request: static("logo.png"),  
        "dark": lambda request: static("logo.png"),  
    },
    "LOGIN": {
        "image": lambda request: static("logo.png"),
    },
    "COLORS": {
        "base": {
            "50": "249, 250, 251",
            "100": "243, 244, 246",
            "200": "229, 231, 235",
            "300": "209, 213, 219",
            "400": "156, 163, 175",
            "500": "107, 114, 128",
            "600": "75, 85, 99",
            "700": "55, 65, 81",
            "800": "31, 41, 55",
            "900": "17, 24, 39",
            "950": "3, 7, 18",
        },
        "primary": {
            "50": "254, 242, 242",
            "100": "254, 226, 226",
            "200": "254, 202, 202",
            "300": "252, 165, 165",
            "400": "248, 113, 113",
            "500": "235, 91, 0",
            "600": "220, 79, 0",
            "700": "185, 66, 0",
            "800": "150, 54, 0",
            "900": "120, 43, 0",
            "950": "80, 29, 0",
        }
    },
    "SIDEBAR": "rent_house.admin_config.get_sidebar_config",
}

CRISPY_TEMPLATE_PACK = "unfold_crispy"

CRISPY_ALLOWED_TEMPLATE_PACKS = ["unfold_crispy"]

SITE_URL = os.getenv('SITE_URL', 'http://localhost:8000')

INTERNAL_IPS = [
 '127.0.0.1'
 ]