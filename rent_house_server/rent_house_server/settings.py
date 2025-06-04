from pathlib import Path
from dotenv import load_dotenv
import os
import pymysql

pymysql.install_as_MySQLdb()


# Load environment variables from .env file
load_dotenv()

import cloudinary
import cloudinary.uploader
import cloudinary.api

# Add after the dotenv load_dotenv() call
# Configure Cloudinary
cloudinary.config( 
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME', ''),
    api_key = os.getenv('CLOUDINARY_API_KEY', ''),
    api_secret = os.getenv('CLOUDINARY_API_SECRET', '')
)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-w5g$n@c%sz5kxf!f00h+a9@4ac8i-va^5^a1a8hom$ad*l%c_y'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '*',
]


# Application definition

INSTALLED_APPS = [
    "unfold",  # before django.contrib.admin
    "unfold.contrib.filters",  # optional, if special filters are needed
    "unfold.contrib.forms",  # optional, if special form elements are needed
    
    "unfold.contrib.inlines",  # optional, if special inlines are needed
    "unfold.contrib.import_export",  # optional, if django-import-export package is used
    "unfold.contrib.guardian",  # optional, if django-guardian package is used
    "unfold.contrib.simple_history",  # optional, if django-simple-history package is used
    #=====================
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
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
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    # Add custom exception handler
    # 'EXCEPTION_HANDLER': 'rent_house.exception_handlers.custom_exception_handler',
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
]

ROOT_URLCONF = 'rent_house_server.urls'

MEDIA_ROOT = '%s/rent_house/static/' % BASE_DIR

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'rent_house/templates')],
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


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    # Use MySQL database
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


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = '%s/static/' % BASE_DIR

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Firebase config (thêm vào cuối file)
FIREBASE_CREDENTIALS = {
    # Thêm thông tin credential từ Firebase console
    # Ví dụ:
    "type": "service_account",
    "project_id": "rent-house-app-xxxx",
    # Các thông tin khác từ firebase credentials...
}

# Cấu hình logging
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



# Telegram Bot Settings
TELEGRAM_DEBUG_ENABLED = os.getenv('TELEGRAM_DEBUG_ENABLED', 'False').lower() == 'true'
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '')
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')

# Email Configuration with Gmail
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')  # Add to .env
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')  # App password from Google
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)

# Verification settings
VERIFICATION_CODE_EXPIRY_MINUTES = 30  # Time in minutes before verification codes expire

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# Only add Telegram handler if enabled
if TELEGRAM_DEBUG_ENABLED:
    LOGGING['handlers']['telegram'] = {
        'level': 'ERROR',  # Only send ERROR and above to Telegram by default
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

DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100 MB 

UNFOLD = {
    "SITE_TITLE": "Quản trị Rent House",
    "SITE_HEADER": "Quản trị Rent House",
    "SITE_SYMBOL": "home",
    "SHOW_HISTORY": True
}

# Site URL for links in emails
SITE_URL = os.getenv('SITE_URL', 'http://localhost:8000')