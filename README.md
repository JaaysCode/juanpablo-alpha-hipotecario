# Sistema de Gestión de Créditos Hipotecarios

Aplicación full-stack para la simulación de créditos hipotecarios con sistema de amortización francés.

**Stack:** NestJS 11 · Angular 22 · PostgreSQL 16 · TypeORM · CQRS · Arquitectura Hexagonal

---

## Tabla de contenidos

1. [Cómo correr el proyecto](#1-cómo-correr-el-proyecto)
   - [Opción A — Docker (recomendado)](#opción-a--docker-recomendado)
   - [Opción B — Manual](#opción-b--manual)
2. [Decisiones de arquitectura](#2-decisiones-de-arquitectura)
3. [Qué decidí NO hacer y por qué](#3-qué-decidí-no-hacer-y-por-qué)
4. [Endpoints disponibles](#4-endpoints-disponibles)
5. [Tests](#5-tests)

---

## 1. Cómo correr el proyecto

### Opción A — Docker (recomendado)

**Prerequisito:** Docker Desktop corriendo.

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd prueba-tecnica-alpha-ingenuity

# 2. Levantar todos los servicios (base de datos, backend, frontend)
docker compose up --build
```

> **Primera vez:** Docker descargará el modelo `llama3.2:1b` (~1.3 GB) automáticamente antes de iniciar el backend. Esperar hasta que aparezca `Application is running on: http://[::1]:3000` en los logs.

Una vez que los contenedores estén corriendo:

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000 |
| Swagger docs | http://localhost:3000/api/docs |

Para detener:

```bash
docker compose down
# Con --volumes para borrar también los datos de PostgreSQL
docker compose down --volumes
```

---

### Opción B — Manual

**Prerequisitos:**
- Node.js >= 22
- pnpm >= 9 (`npm install -g pnpm`)
- PostgreSQL 16 corriendo localmente

#### 1. Base de datos

```sql
-- En psql o pgAdmin, crear la base de datos
CREATE DATABASE prueba_tecnica;
```

#### 2. Backend

```bash
cd backend

# Copiar variables de entorno
cp .env.example .env
# Editar .env si tus credenciales de Postgres difieren del default

# Instalar dependencias
pnpm install

# Correr en modo desarrollo (hot-reload)
pnpm start:dev
```

El backend inicia en http://localhost:3000.  
La documentación Swagger está en http://localhost:3000/api/docs.

> **Nota:** `synchronize: true` está habilitado en desarrollo — TypeORM crea/actualiza las tablas automáticamente al iniciar. No se requiere correr migraciones.

#### 3. Frontend

```bash
cd frontend

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm start
```

El frontend inicia en http://localhost:4200. Las llamadas API van a `/api/*` y el dev-server las redirige al backend en `http://localhost:3000` vía `proxy.conf.json`.

---

## 2. Decisiones de arquitectura

### Arquitectura Hexagonal (Ports & Adapters)

Cada módulo (`clients`, `loans`) está organizado en tres capas:

```
src/modules/<module>/
├── domain/
│   ├── entities/        # Entidades de dominio puras (sin dependencias de framework)
│   └── ports/           # Interfaces (IClientRepository, ILoanRepository)
├── application/
│   ├── commands/        # Casos de uso de escritura (CQRS)
│   ├── queries/         # Casos de uso de lectura (CQRS)
│   └── dtos/            # Objetos de transferencia de datos con validación
└── infrastructure/
    ├── adapters/http/   # Controladores REST
    └── adapters/persistence/ # Implementaciones TypeORM de los puertos
```

**Por qué:** Las entidades de dominio no conocen NestJS ni TypeORM. Si mañana cambiamos de PostgreSQL a MongoDB, solo se reemplaza la capa de infraestructura. Los tests unitarios no necesitan base de datos real.

### CQRS con CommandBus / QueryBus

Operaciones de escritura (simular crédito, crear cliente) pasan por `CommandBus`. Operaciones de lectura pasan por `QueryBus`. Cada handler tiene una única responsabilidad.

**Por qué:** Separa claramente intención de lectura vs. escritura. Escala mejor cuando los modelos de lectura y escritura divergen.

### Sistema de amortización francés (cuota fija)

La cuota mensual se calcula con la fórmula PMT:

```
PMT = P × (r × (1+r)^n) / ((1+r)^n - 1)
```

Donde `P` = monto del crédito, `r` = tasa mensual, `n` = número de cuotas.  
Cada mes: `interés = saldo × r`, `capital = PMT − interés`, `nuevo saldo = saldo − capital`.

### Regla de pre-aprobación

| Relación cuota/ingreso | Estado |
|---|---|
| < 25% | `PRE_APPROVED` |
| 25% – 30% | `PRE_APPROVED_WITH_OBSERVATIONS` |
| > 30% | `REJECTED` — "Capacidad de pago excedida." |

### Validación de inputs

- **Backend:** `ValidationPipe` global con `class-validator`. DTOs decorados con `@IsNumber`, `@Min`, `@Max`, `@IsEmail`, etc. Retorna 400 con detalle del campo fallido.
- **Frontend:** Formularios reactivos Angular con `Validators` declarativos. Errores mostrados por campo en tiempo real.

### Códigos HTTP

| Escenario | Código |
|---|---|
| Creación exitosa | 201 |
| Recurso no encontrado | 404 (`NotFoundException`) |
| Datos inválidos | 400 (`BadRequestException` / `ValidationPipe`) |
| Duplicado (CC o email) | 409 (`ConflictException`) |

---

## 3. Qué decidí NO hacer y por qué

**Autenticación / JWT**  
No estaba en los requisitos. Añadirlo habría requerido un módulo de usuarios, guards, y refresh tokens — scope que desvía del foco de la prueba (simulación hipotecaria).

**Migraciones de base de datos**  
Se usa `synchronize: true` de TypeORM en desarrollo. En producción esto sería un riesgo (puede mutar esquemas sin control), pero para una prueba técnica con PostgreSQL local simplifica el setup del revisor significativamente.

**Tests de integración / E2E**  
Se priorizaron los tests unitarios del handler de dominio (lógica de amortización y reglas de pre-aprobación) porque son los más propensos a errores de cálculo y los más valiosos para verificar correctitud del sistema francés. Los E2E requieren base de datos real y aumentan la complejidad del CI sin añadir cobertura nueva sobre la lógica financiera.

**Paginación en la respuesta de amortización**  
La tabla de amortización se retorna completa (hasta 360 cuotas para 30 años). No se paginó porque es un objeto de consulta estático — el cliente la necesita toda para mostrar el resumen financiero.

**Módulo de usuarios separado**  
El `monthlyIncome` se guarda en el cliente directamente (campo declarado). Un sistema real tendría validación crediticia externa (centrales de riesgo). Eso queda fuera del alcance de la prueba.

**Variables de entorno en frontend**  
Las llamadas al backend usan rutas relativas (`/api/*`). En Docker, nginx hace proxy de `/api/` → `http://backend:3000/`. En desarrollo local, Angular dev-server usa `proxy.conf.json` para el mismo rewrite. En un proyecto real se usaría `environment.ts` por cada ambiente.

---

## 4. Endpoints disponibles

La documentación interactiva completa está en **http://localhost:3000/api/docs** (Swagger UI).

### Clientes

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/clients` | Crear cliente |
| `GET` | `/clients` | Listar clientes (paginado, búsqueda) |
| `GET` | `/clients/:id` | Detalle de cliente |
| `GET` | `/clients/:id/loans` | Simulaciones de un cliente |

### Créditos

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/loans/simulate` | Simular crédito hipotecario |
| `GET` | `/loans/:id` | Detalle de simulación con tabla de amortización |

---

## 5. Tests

```bash
cd backend

# Correr tests unitarios
pnpm test

# Con cobertura
pnpm test:cov
```

Los tests están en `backend/test/application/loans/simulate-loan.handler.spec.ts` y cubren:

1. La tabla de amortización tiene exactamente `termInYears × 12` entradas
2. En cada cuota: `capital + interés = cuota` (tolerancia ≤ 1 COP por redondeo)
3. El saldo final es ≈ 0 (tolerancia ≤ 1 COP)
4. El saldo decrece monótonamente mes a mes
5. Cuota < 25% del ingreso → estado `PRE_APPROVED`
6. Cuota entre 25%–30% del ingreso → estado `PRE_APPROVED_WITH_OBSERVATIONS`
7. Cuota > 30% del ingreso → estado `REJECTED` con razón "Capacidad de pago excedida."
8. Cuota inicial ≥ valor del inmueble → `BadRequestException` (sin persistencia)
