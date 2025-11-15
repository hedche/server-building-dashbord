"""
Configuration management using Pydantic Settings
Follows 12-factor app principles for configuration
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings with validation"""
    
    # Application
    APP_NAME: str = "Server Building Dashboard"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # Security
    SECRET_KEY: str
    SESSION_LIFETIME_SECONDS: int = 28800  # 8 hours
    COOKIE_DOMAIN: str | None = None
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"
    
    # SAML2 Configuration
    SAML_METADATA_PATH: str = "./saml_metadata/idp_metadata.xml"
    SAML_ENTITY_ID: str
    SAML_ACS_URL: str  # Assertion Consumer Service URL
    SAML_SLS_URL: str | None = None  # Single Logout Service URL (optional)
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 100
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Database (for future implementation)
    DATABASE_URL: str | None = None
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    def get_saml_settings(self) -> dict:
        """
        Generate SAML settings dictionary for python3-saml
        """
        # Read metadata file
        if not os.path.exists(self.SAML_METADATA_PATH):
            raise FileNotFoundError(
                f"SAML metadata file not found: {self.SAML_METADATA_PATH}"
            )
        
        with open(self.SAML_METADATA_PATH, 'r') as f:
            idp_metadata = f.read()
        
        saml_settings = {
            "strict": True,
            "debug": self.DEBUG,
            "sp": {
                "entityId": self.SAML_ENTITY_ID,
                "assertionConsumerService": {
                    "url": self.SAML_ACS_URL,
                    "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                },
                "attributeConsumingService": {
                    "serviceName": self.APP_NAME,
                    "serviceDescription": "Server Building Dashboard",
                    "requestedAttributes": [
                        {
                            "name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
                            "isRequired": True
                        },
                        {
                            "name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
                            "isRequired": False
                        },
                        {
                            "name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
                            "isRequired": False
                        },
                        {
                            "name": "http://schemas.microsoft.com/ws/2008/06/identity/claims/groups",
                            "isRequired": False
                        }
                    ]
                },
                "NameIDFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
            },
            "security": {
                "nameIdEncrypted": False,
                "authnRequestsSigned": False,
                "logoutRequestSigned": False,
                "logoutResponseSigned": False,
                "signMetadata": False,
                "wantMessagesSigned": False,
                "wantAssertionsSigned": True,
                "wantAssertionsEncrypted": False,
                "wantNameIdEncrypted": False,
                "requestedAuthnContext": True,
                "signatureAlgorithm": "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
                "digestAlgorithm": "http://www.w3.org/2001/04/xmlenc#sha256"
            },
            "contactPerson": {
                "technical": {
                    "givenName": "Technical Support",
                    "emailAddress": "support@company.com"
                },
                "support": {
                    "givenName": "Support Team",
                    "emailAddress": "support@company.com"
                }
            },
            "organization": {
                "en-US": {
                    "name": self.APP_NAME,
                    "displayname": self.APP_NAME,
                    "url": self.FRONTEND_URL
                }
            }
        }
        
        return saml_settings, idp_metadata


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Using lru_cache ensures settings are loaded once
    """
    return Settings()


# Global settings instance
settings = get_settings()