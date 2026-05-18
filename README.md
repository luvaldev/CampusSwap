# CampusSwap

---

## Sobre el Proyecto

**CampusSwap** es una plataforma SaaS de colaboración académica diseñada exclusivamente para estudiantes universitarios. Nace como solución al caos y la fragmentación de la información académica (grupos de WhatsApp saturados, links de Drive rotos o sin acceso) centralizando apuntes y material de estudio en un entorno seguro.

Este proyecto es desarrollado como parte de la asignatura **Ingeniería de Software (2026)** en la **Universidad Diego Portales**.

### Características Principales

- 🔐 **Acceso Exclusivo:** Autenticación estricta mediante Google OAuth2. Solo se permite el ingreso a correos institucionales válidos (`@udp.cl` y `@mail.udp.cl`).
- 📚 **Dashboard Personalizado:** Organización jerárquica del material por Facultad, Carrera y Ramo.
- 🛡️ **Estado de Cuarentena (Próximamente):** Los archivos subidos pasan por un proceso de moderación por pares antes de ser públicos.
- ⭐ **Economía de Karma Points:** Sistema de reputación donde los estudiantes ganan puntos por aportar material válido y moderar, fomentando un ecosistema de alta calidad.

---

## Stack Tecnológico

El proyecto está construido con un stack moderno y escalable:

- **Frontend:** Next.js (App Router), React, Tailwind CSS.
- **Íconos & UI:** Lucide React, componentes inspirados en Shadcn/UI.
- **Autenticación:** NextAuth.js (Google Provider).
- **Despliegue:** Vercel (CI/CD automático).
- **Backend & Base de Datos (Sprint 2):** NestJS / Node.js, PostgreSQL con Prisma ORM.

---

## Roadmap y Sprints

### ✅ Sprint 1: Cimientos y Acceso (Actual)

* [x] Inicialización del proyecto con Next.js y Tailwind CSS.
* [x] Integración de Google OAuth2 vía NextAuth.
* [x] Middleware de seguridad: Restricción estricta de dominios (`@udp.cl` y `@mail.udp.cl`).
* [x] Manejo de errores de acceso (UI dinámica de advertencia).
* [x] Maquetación base del Dashboard (Sidebar, Layout interactivo).
* [x] Despliegue en producción mediante Vercel.

### 🚧 Sprint 2: Core de Datos y Cuarentena (En planificación)

* [ ] Implementación de PostgreSQL y esquema de Prisma.
* [ ] Motor de subida de archivos (Multipart/form-data) con filtro de extensiones.
* [ ] Lógica de "Estado de Cuarentena" para archivos entrantes.
* [ ] Sistema básico de suma/resta de Karma Points.

---

## 👥 Equipo de Desarrollo (Grupo 7)

* **Matías Vigneau** - *Product Owner*
* **Luis Valdenegro M.** - *Scrum Master & Lead Developer*

---
