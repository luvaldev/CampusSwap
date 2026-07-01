# Plan de Implementación: Cloudflare R2 y Optimización

Excelente decisión. Cloudflare R2 nos dará 10 GB de almacenamiento gratuito sin costos por descargas, lo cual es vital para una plataforma de estudiantes. Además, implementaremos optimización de imágenes.

## 1. Lo que tienes que hacer (Configurar Cloudflare R2)

Para poder programar esto, necesitaré que crees la cuenta en Cloudflare y me entregues 4 datos. **Sigue estos pasos**:

> [!IMPORTANT]
> **Pasos en Cloudflare:**
> 1. Crea una cuenta gratuita en [Cloudflare](https://dash.cloudflare.com/sign-up).
> 2. En el menú izquierdo, ve a **R2** e ingresa una tarjeta de débito/crédito (Cloudflare requiere esto para verificar que eres humano, pero **no te cobrarán** mientras no pases de 10 GB).
> 3. Crea un **Bucket** llamado `campusswap` (o como quieras).
> 4. En la configuración del Bucket, ve a **Settings > Public Access > Custom Domains** y habilita el acceso público (o usa el dominio que te da Cloudflare por defecto que dice "r2.dev").
> 5. Vuelve al inicio de R2, haz clic en **"Manage R2 API Tokens"** (arriba a la derecha) y crea un token con permisos de **Object Read & Write**.
> 
> **Luego de hacer esto, añade estas variables a tu archivo `.env`:**
> ```env
> R2_ACCOUNT_ID="tu_account_id"
> R2_ACCESS_KEY_ID="tu_access_key"
> R2_SECRET_ACCESS_KEY="tu_secret_key"
> R2_PUBLIC_URL="la_url_publica_de_tu_bucket" # Ej: https://pub-xxxx.r2.dev
> ```

## 2. Lo que yo haré (Código)

### Cambio de Almacenamiento
- Instalaré `@aws-sdk/client-s3` (R2 funciona con el protocolo de Amazon S3, así que usamos esa librería).
- Reemplazaré la subida actual (que usaba Supabase) para que los archivos vayan directo a tu Bucket de Cloudflare R2.
- Las URLs que se guardarán en la base de datos ahora serán las URLs públicas de Cloudflare.

### Optimización y Límites de Peso
- **Límite Estricto:** Mantendré el límite de **10 MB** por archivo. Es un estándar muy bueno. Para PDFs de texto, 10 MB son cientos de páginas.
- **Optimización de Imágenes:** Instalaré la librería `sharp`. Si el estudiante sube un `.jpg` o `.png` pesado (ej. fotos de cuadernos de 5 MB), el servidor la interceptará, le bajará la resolución inteligentemente, la convertirá a formato web moderno (WebP) y la subirá pesando apenas unos `kb`, ahorrando muchísimo de tus 10 GB gratuitos.
- **¿Y los PDFs?** Comprimir PDFs en el servidor es una tarea pesadísima que podría hacer que tu página se caiga si muchos lo hacen a la vez. Para PDFs, simplemente rechazaremos los mayores a 10 MB y le pediremos al usuario que los comprima en "ilovepdf.com" antes de subirlo.

## ¿Qué sigue?
Si estás de acuerdo con este plan, dame el visto bueno. Mientras yo programo todo, tú puedes ir creando la cuenta de Cloudflare R2 y obteniendo las credenciales.
