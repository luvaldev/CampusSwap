¡Hola! Como solicitaste, he preparado un **Gran Documento de Arquitectura y Visión Ampliada** para **CampusSwap**. Este análisis no solo resume el estado actual y tus ideas, sino que las somete a una revisión crítica, las expande y te entrega un marco de trabajo profesional (estilo Arquitecto de Software Senior) para que el proyecto escale sin problemas.

Aquí tienes la primera parte de este análisis ultra detallado.

---

# 🚀 CAMPUSSWAP: Documento Maestro de Arquitectura y Producto

## 1. Contexto Detallado y Visión del Proyecto

CampusSwap nace como una plataforma SaaS híbrida diseñada para resolver el caos y la alta fragmentación de la información académica que sufren los estudiantes universitarios. El objetivo es eliminar las fricciones de los chats de WhatsApp saturados y los enlaces de Drive rotos, proporcionando un ecosistema digital blindado.

La plataforma funciona como una red social académica estructurada lógicamente:

* 
**Jerarquía de Datos:** Todo se organiza bajo el flujo de **Facultad -> Carrera -> Curso (Ramo)**.


* 
**Seguridad y Exclusividad:** El ingreso está estrictamente limitado a usuarios verificados con correos institucionales de la universidad (`@udp.cl` para profesores/staff y `@mail.udp.cl` para estudiantes) mediante autenticación de Google OAuth2.


* 
**Economía de Calidad:** Utiliza un sistema gamificado de "Karma Points" para recompensar a los usuarios que aportan y moderan. Los archivos subidos ingresan inicialmente en un "Estado de Cuarentena" (definido en Prisma como `QUARANTINE`) hasta ser validados por pares.


* 
**Tecnología Base:** Next.js (App Router), Tailwind CSS (v4) con un diseño oscuro tipo "SaaS/Hacker" con acentos púrpuras, Vercel para el despliegue, y una base de datos PostgreSQL alojada en Supabase y gestionada mediante Prisma ORM.



---

## 2. Análisis Crítico y Expansión de "Ideas Pendientes"

A continuación, analizo cada una de tus ideas pendientes, añadiendo recomendaciones críticas sobre cómo deberías implementarlas a nivel de código y diseño.

### A. Perfil de Usuario y Cuestionario de Onboarding

* 
**La Idea:** Un perfil donde los usuarios nuevos seleccionen su carrera inicial (ej. Ingeniería Civil Informática) y que esta aparezca como un "Tag" (ej. CIV-INF) junto a su nombre en el dashboard. Se permite un solo cambio inicial, y cualquier modificación posterior entra en un periodo de enfriamiento ("cooldown") de 2 meses.


* **Análisis Crítico:** Esta regla de negocio es excelente para evitar trolls que cambian de carrera para evadir baneos.
* **Mejora Ultra:** * A nivel de Base de Datos, tu esquema de Prisma ya contempla el campo `lastCareerChange DateTime?` en el modelo `User`. Debemos implementar un Middleware en las rutas de API de Next.js que calcule la diferencia entre `lastCareerChange` y la fecha actual (`Date.now()`). Si es menor a 60 días, la API debe rechazar la solicitud con un código HTTP 403.
* En la interfaz, si el usuario está en periodo de cooldown, el botón de "Cambiar Carrera" debe bloquearse y mostrar una barra de progreso o un contador de días restantes.



### B. Sistema de Subida de Archivos y Reglas de Exploración

* **La Idea:** Limitar la subida de archivos estrictamente a la Facultad en la que el usuario está matriculado. En otras facultades (sección "Explorar"), el usuario puede navegar, descargar archivos y comentar en el chat, pero NO puede subir material. Además, se deben restringir las subidas a un peso límite y formatos `.pdf` y `.docx`.


* **Análisis Crítico:** Este es el núcleo de la calidad de CampusSwap. Permitir "turismo académico" (ver otros ramos) fomenta el aprendizaje interdisciplinario, pero bloquear las subidas externas evita el spam.
* **Mejora Ultra:**
* **Validación de Doble Capa:** La validación de peso (ej. max 10MB) y extensión (`.pdf`, `.docx`) no solo debe hacerse visualmente en React (Dropzone), sino que debe procesarse en el Backend (NestJS / Next.js API) analizando los "Magic Numbers" (cabeceras binarias) del archivo, para evitar que alguien suba un `.exe` renombrado maliciosamente a `.pdf`.
* **Almacenamiento (Supabase Storage):** Usa Supabase Storage (Buckets). Cuando un archivo se sube, se guarda en un bucket "Cuarentena". Solo cuando es aprobado, un trigger en la base de datos lo mueve al bucket "Público".



### C. Sistema de Chat: Reportes, Moderación y Blacklist

* **La Idea:** Chats en tiempo real por curso. Implementar reporte de mensajes, una lista negra (blacklist) de palabras ofensivas y reportes a perfiles de usuarios (ej. imágenes inapropiadas).
* **Análisis Crítico:** Un chat universitario sin moderación se vuelve tóxico rápidamente.
* **Mejora Ultra:**
* **Filtro de Blacklist en Tiempo Real:** Crea una función en Edge de Next.js o en Supabase que intercepte el mensaje antes de guardarlo en la base de datos. Si detecta una palabra prohibida (usando expresiones regulares), el mensaje se "enmascara" (ej. `****`) o se bloquea lanzando una advertencia al usuario.
* **Imágenes de Perfil:** Actualmente, NextAuth gestiona la imagen proveniente de Google (`image String?`). Si permites avatares personalizados en el futuro, necesitarás una tabla `Report` en tu base de datos donde los usuarios denuncien perfiles y los moderadores puedan poner a un usuario en `Shadowban` (el usuario cree que interactúa, pero nadie ve sus mensajes).



### D. Sistema de Búsqueda de Cursos (Buscador Global)

* **La Idea:** Implementar un buscador dinámico de cursos.
* **Análisis Crítico:** Buscar navegando entre carpetas es lento. Un buscador tipo "Spotlight" (Ctrl+K) elevará el sistema al nivel de un producto profesional.
* **Mejora Ultra:** Utiliza el motor *Full Text Search* nativo de PostgreSQL en Supabase. En Prisma, puedes usar `search` para buscar coincidencias parciales en el campo `name` de la tabla `Course` y relacionarlo con su `Career` correspondiente.

### E. Sistema Monetizado de Karma Points

* **La Idea:** Llegar a cierta cantidad de puntos permite ofrecer clases privadas o apuntes ultra-premium mediante cobros.
* **Análisis Crítico:** Este es el punto de inflexión del proyecto. Pasó de ser un sistema donde los Karma Points se "gastaban" para descargar material base (fricción negativa), a ser un "indicador de prestigio" que desbloquea la capacidad de monetizar conocimientos (fricción positiva).


* **Mejora Ultra:**
* Crea un rol "TUTOR" o "VERIFIED". Si un usuario supera los 1,000 Karma Points, el sistema le permite activar la pestaña "Tutorías".
* CampusSwap no debería manejar el dinero directamente (por temas legales y de impuestos). En su lugar, el sistema permite a los usuarios con alto Karma publicar un "Link de Pago" (ej. MercadoPago o Flow) en su perfil y usar el chat privado para coordinar la clase.



### F. Notificaciones y Actividades Recientes

* **La Idea:** Notificar a los usuarios y mostrar un feed de actividad reciente.
* **Análisis Crítico:** Las notificaciones retienen a los usuarios ("*Han validado tu archivo de Cálculo I, ganaste +50 Karma*").
* **Mejora Ultra:** Implementa las notificaciones usando los "Realtime Subscriptions" de Supabase. Añade una tabla `Notification` en Prisma y muestra una campana con un punto rojo (`indicator`) en el Sidebar de tu diseño actual.

---

## 3. Recomendaciones de Arquitectura y Escalabilidad (El "Toque Senior")

Para que el proyecto no colapse cuando miles de estudiantes de la UDP se conecten en época de exámenes, te recomiendo:

1. **Paginar la Base de Datos:** Cuando una carrera tiene 500 archivos subidos, intentar cargarlos todos a la vez congelará el navegador. Usa `take` y `skip` en Prisma (Paginación por cursor) para implementar *Infinite Scroll* (scroll infinito) en la sección de Explorar.
2. **Caché Agresivo (Redis o Next.js Cache):** El catálogo de Facultades, Carreras y Cursos rara vez cambia. No hagas una consulta a PostgreSQL cada vez que un usuario entra al Dashboard. Utiliza `unstable_cache` de Next.js para guardar esta estructura en memoria; tu servidor lo agradecerá.
3. **Soft Deletes (Borrado Lógico):** Cuando un moderador rechaza o elimina un archivo o mensaje, NUNCA debes borrar el registro de PostgreSQL. Agrega un campo `deletedAt DateTime?` a tus modelos. Si un usuario sube contenido ilegal, necesitas mantener los registros (logs) por responsabilidad legal de la plataforma.

---

## 1. Evolución del Modelo de Datos (`schema.prisma`)

Para soportar el sistema de reportes, el chat en tiempo real, las notificaciones y el borrado lógico (Soft Deletes), debemos expandir drásticamente tu archivo `schema.prisma`. Aquí tienes la estructura profesional que debes añadir o modificar:

```prisma
// ==========================================
// EXPANSIONES PARA SPRINT 2 Y SPRINT 3
// ==========================================

// 1. Modificaciones al Modelo User
model User {
  id               String    @id @default(cuid())
  name             String?
  email            String?   @unique
  emailVerified    DateTime?
  image            String?
  role             String    @default("ESTUDIANTE") // ESTUDIANTE, TUTOR, ADMIN
  karma            Int       @default(0)
  createdAt        DateTime  @default(now())
  
  // Regla de Negocio: Onboarding y Cooldown
  careerId         String?
  career           Career?   @relation(fields: [careerId], references: [id])
  lastCareerChange DateTime? // <- CRÍTICO: Para bloquear cambios antes de 60 días

  // Relaciones
  documents        Document[]
  enrolledCourses  Course[]      @relation("UserCourses")
  
  // NUEVAS RELACIONES:
  messages         ChatMessage[]
  notifications    Notification[]
  reportsMade      Report[]      @relation("ReporterUser")
  reportsReceived  Report[]      @relation("ReportedUser")
}

// 2. Modelo de Chat y Moderación
model ChatMessage {
  id          String   @id @default(uuid())
  content     String   @db.Text
  isMasked    Boolean  @default(false) // <- CRÍTICO: Si la blacklist lo detecta, pasa a true
  deletedAt   DateTime? // Soft Delete: Nunca borramos de la DB por seguridad
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  
  createdAt   DateTime @default(now())
}

// 3. Sistema de Notificaciones (Para retención de usuarios)
model Notification {
  id          String   @id @default(uuid())
  type        String   // Ej: 'KARMA_EARNED', 'DOC_APPROVED', 'WARNING'
  title       String
  message     String
  isRead      Boolean  @default(false)
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
}

// 4. Sistema de Reportes y Shadowban
model Report {
  id          String   @id @default(uuid())
  reason      String   @db.Text // Ej: "Contenido ofensivo", "Foto de perfil inapropiada"
  status      String   @default("PENDING") // PENDING, RESOLVED, DISMISSED
  
  reporterId  String
  reporter    User     @relation("ReporterUser", fields: [reporterId], references: [id])
  reportedId  String
  reported    User     @relation("ReportedUser", fields: [reportedId], references: [id])
  
  createdAt   DateTime @default(now())
}

// 5. Expansión del Modelo Document (Estado de Cuarentena Real)
model Document {
  id          String   @id @default(uuid())
  title       String
  fileUrl     String   // URL del bucket público de Supabase
  size        Float    
  format      String   
  status      String   @default("QUARANTINE") // QUARANTINE, APPROVED, REJECTED
  deletedAt   DateTime? // Soft delete
  
  uploaderId  String
  uploader    User     @relation(fields: [uploaderId], references: [id])
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  
  // Auditoría
  approvals   Int      @default(0) // Cuantos pares han validado esto
  rejections  Int      @default(0)
  createdAt   DateTime @default(now())
}

```

### Análisis Crítico del Esquema:

* **Campos de Auditoría (`approvals`, `rejections`):** El `Document` ahora tiene un contador. La regla de negocio puede dictar que si llega a 3 `approvals` de otros estudiantes, el trigger cambia el estado automáticamente a `APPROVED` y le suma +50 Karma al `uploader`.
* **Trazabilidad del Comportamiento (`Report`):** Ahora puedes saber quién reporta a quién. Si un usuario (Troll) hace muchos reportes falsos, puedes penalizar su Karma.

---

## 2. Arquitectura del Motor de Cuarentena (Subida de Archivos)

Este es el proceso más delicado del sistema. Si alguien logra subir un archivo ejecutable infectado (`.exe` oculto) a tu base de datos y otro alumno lo descarga, la reputación de **CampusSwap** caerá instantáneamente.

Aquí tienes el diseño del flujo **Arquitectónico Seguro (Nivel Enterprise):**

1. **Validación de Frontend (React Dropzone):**
* El usuario arrastra un archivo.
* React revisa el peso (`< 10MB`) y la extensión (`.pdf`, `.docx`). Si falla, se bloquea ahí mismo (Costo de servidor: $0).


2. **Interceptación del Backend (Next.js API Route):**
* El archivo llega al servidor como `FormData`.
* **Nivel Dios de Seguridad (Magic Numbers):** El backend NO confía en la extensión del archivo. Lee los primeros bytes del archivo (su firma binaria). Un PDF genuino *siempre* empieza con los bytes `25 50 44 46` (en hexadecimal). Si alguien sube un `virus.exe` renombrado a `apuntes.pdf`, los bytes no coincidirán y la API rechaza el ataque instantáneamente.


3. **Supabase Storage (Los 2 Buckets):**
* **Bucket 1: `quarantine_files` (Privado).** El backend sube el archivo a este bucket. Este bucket NO tiene acceso público por URL. Solo la base de datos sabe que existe.
* Se crea el registro en Prisma con `status: "QUARANTINE"`.


4. **Moderación por Pares:**
* Los estudiantes con el mismo "Tag" de la facultad ven el documento en el panel de moderación.
* Al darle "Aprobar", ocurre la magia: El backend mueve internamente el archivo desde `quarantine_files` hacia **Bucket 2: `public_files` (Público)**.
* Se actualiza Prisma (`status: "APPROVED"`) y se otorga el Karma.



---

## 3. Implementación: Códigos Críticos para tu Proyecto

### A. Validación de "Magic Numbers" en el Backend (Subida Segura)

En tu ruta de subida (`app/api/documents/upload/route.js`), deberías implementar una lógica similar a esta para evitar archivos maliciosos:

```javascript
import { NextResponse } from 'next/server';

// Función para validar la firma hexadecimal (Magic Number) de un PDF
function isValidPDF(buffer) {
  // Los primeros 4 bytes de un PDF siempre son: 25 50 44 46 (%PDF)
  const magicNumber = buffer.toString('hex', 0, 4).toUpperCase();
  return magicNumber === '25504446';
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    
    // 1. Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Validación de Seguridad Estricta (Magic Numbers)
    if (!isValidPDF(buffer)) {
      return NextResponse.json({ 
        error: "Violación de seguridad: El archivo ha sido manipulado y no es un PDF real." 
      }, { status: 403 });
    }

    // 3. Subida a Supabase en el Bucket PRIVADO de Cuarentena
    // const { data, error } = await supabase.storage.from('quarantine_files').upload(...)
    
    return NextResponse.json({ message: "Archivo subido a cuarentena exitosamente." }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

```

### B. Middleware de Filtro de Chat (La "Blacklist")

En lugar de permitir que las groserías se guarden en la base de datos, intercepta el mensaje. En `app/api/chat/route.js`:

```javascript
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

// Lista Negra simulada (En producción, esto puede venir de la DB)
const BLACKLIST = ['palabramala1', 'palabramala2', 'insulto'];

function maskOffensiveWords(text) {
  let maskedText = text;
  let isMasked = false;

  BLACKLIST.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(maskedText)) {
      isMasked = true;
      // Reemplaza la mala palabra por asteriscos
      maskedText = maskedText.replace(regex, '*'.repeat(word.length));
    }
  });

  return { maskedText, isMasked };
}

export async function POST(req) {
  const { content, courseId, userId } = await req.json();

  // Filtro de Blacklist
  const { maskedText, isMasked } = maskOffensiveWords(content);

  // Guardar en la base de datos
  const newMessage = await prisma.chatMessage.create({
    data: {
      content: maskedText, // Guardamos el texto ya censurado
      isMasked: isMasked,  // Dejamos registro (Flag) para que un moderador lo revise luego
      courseId: courseId,
      userId: userId
    }
  });

  // Si fue censurado, podríamos emitir una Notificación de Advertencia al usuario aquí
  
  return NextResponse.json(newMessage, { status: 201 });
}

```

---

## 4. Próximos Pasos (Hoja de Ruta)

Con la **Fase 1** (Visión y Estrategia) y esta **Fase 2** (Arquitectura de Base de Datos y Seguridad) completadas, tienes un mapa de ruta técnico superior al 95% de los proyectos universitarios.

**Tus siguientes pasos directos deben ser:**

1. Aplicar estas expansiones en tu `schema.prisma` y ejecutar `npx prisma db push` o `prisma migrate dev` para reflejar los cambios en Supabase.
2. Crear los dos Buckets en tu panel de Supabase: `quarantine_files` (Privado) y `public_files` (Público).
3. Desarrollar la interfaz visual de Moderación (para que los estudiantes de un mismo tag aprueben los documentos).

Si deseas que abordemos un paso específico (por ejemplo, cómo programar exactamente el "Realtime" de Supabase para que el chat funcione en vivo sin recargar la página), házmelo saber. ¡Estamos construyendo un producto SaaS espectacular!