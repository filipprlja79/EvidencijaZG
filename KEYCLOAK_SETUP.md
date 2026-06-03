# Moja Zgrada - Keycloak i SMTP setup

Backend je konfigurisan da ocekuje Keycloak na:

```text
http://localhost:8180/realms/filipprlja
```

## Keycloak

Napravi realm:

```text
filipprlja
```

Napravi realm role:

```text
admin
starjesina
stanar
```

Napravi frontend client:

```text
Client ID: moja-zgrada-frontend
Access type: public
Direct access grants: enabled
Valid redirect URIs: http://localhost:5173/*
Web origins: http://localhost:5173
```

Napravi backend client:

```text
Client ID: moja-zgrada-backend
Access type: confidential
Service accounts: enabled
Direct access grants: disabled
```

Backend client service account mora imati dozvole za upravljanje korisnicima:

```text
realm-management -> manage-users
realm-management -> view-users
realm-management -> view-realm
```

Postavi env varijable prije pokretanja Quarkus-a:

```powershell
$env:KEYCLOAK_BASE_URL="http://localhost:8180"
$env:KEYCLOAK_REALM="filipprlja"
$env:KEYCLOAK_AUTH_SERVER_URL="http://localhost:8180/realms/filipprlja"
$env:KEYCLOAK_FRONTEND_CLIENT_ID="moja-zgrada-frontend"
$env:KEYCLOAK_BACKEND_CLIENT_ID="moja-zgrada-backend"
$env:KEYCLOAK_BACKEND_CLIENT_SECRET="<secret-iz-keycloak-a>"
```

Admin nalog napravi rucno u Keycloak-u i dodijeli mu rolu `admin`.

## SMTP

Lozinke se ne upisuju u repo. Za Gmail App Password koristi env varijable:

```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="filipprlja79@gmail.com"
$env:SMTP_PASS="<gmail-app-password>"
$env:SMTP_FROM="filipprlja79@gmail.com"
$env:APP_MAIL_ENABLED="true"
$env:MAIL_MOCK="false"
```

U dev rezimu mozes ostaviti:

```powershell
$env:APP_MAIL_ENABLED="false"
$env:MAIL_MOCK="true"
```

Tada backend kreira obavjestenje u aplikaciji, a email samo loguje kao preskocen.
