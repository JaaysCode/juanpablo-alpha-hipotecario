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

**Módulo de usuarios separado**  
El `monthlyIncome` se guarda en el cliente directamente (campo declarado). Un sistema real tendría validación crediticia externa (centrales de riesgo). Eso queda fuera del alcance de la prueba.

**Variables de entorno en frontend**  
Las llamadas al backend usan rutas relativas (`/api/*`). En Docker, nginx hace proxy de `/api/` → `http://backend:3000/`. En desarrollo local, Angular dev-server usa `proxy.conf.json` para el mismo rewrite. En un proyecto real se usaría `environment.ts` por cada ambiente.

---

## 4. ¿Qué partes del código te dan más orgullo? ¿Por qué?

### Explicación de una simulación

Me siento feliz de esta parte del código, porque no me había puesto en la tarea de intentar implementar alguna funcionalidad con inteligencia artificial, por lo que me pone feliz por primera vez poder lograr esto y me causa más curiosidad que otras cosas se pueden hacer.

### Arquitectura del proyecto

Aunque no es código directamente, me siento orgulloso de la estructura que le di, y porque pude entender aún mas cosas acerca de esta arquitectura y sus beneficios, por ejemplo que cada módulo sea hexagonal, podría dar pie a que en un futuro se pueda convertir en un microservicio de ser necesario

## 5. ¿Qué mejorarías si tuvieras 1 semana más?

Streaming respuesta LLM — ahora mismo se espera a que se complete. Mostrar texto conforme llega = UX más fluido
Fallback a template — si Ollama falla, generar explicación básica con en lugar de error
Cachear explicaciones — misma simulación = mismo resultado. Redis/localStorage evita re-llamar LLM
Tests explicador — no hay specs para ollama-loan-explainer.ts. Mockear ChatOllama, validar que el prompt contenga datos
Security: .env con OLLAMA_HOST — ahora es default hardcoded localhost:11434 → expone setup local

## 6. ¿Usaste IA durante la prueba? ¿En qué partes específicas y por qué? ¿Cuándo decidiste NO usarla?

Si use IA durante la prueba, la use para la creación de carpetas, para la creación de archivos, y escritura de código, como dtos, controllers, handlers, vistas, uso de skills etc, porque esto me ayuda a recortar el tiempo que podría gastar escribiendo código manualmente y usarlo para otras tareas como por ejemplo, buscar que modelos están disponibles para el plus, cuales serían gratis para el uso de tareas como estas, también porque no soy un experto en diseño UI/UX y quería explorar nuevas skills de los agentes que no había usado antes, también la use para la dockerización, ya que no me acordaba muy bien de como se hacía y asi refresque la memoria.

Decidí no usarla para decidir que arquitectura iba a utilizar, para decidir que cada modulo iba a ser hexagonal, para la estructura de los tests, y para el uso del patrón CQRS, porque aunque para esta prueba no sea algo muy robusto lo que hay que entregar, decidí hacerlo así, ya que de esta manera, y con estas decisiones, es que se debería crear un producto real, robusto y escalable en el mundo laboral y asi ahorrarse algunos problemas en el futuro.

## 6. Si hiciste el Plus IA: ¿qué LLM usaste? ¿qué decisiones de prompt engineering tomaste? ¿cómo manejas los costos/errores?

LLM usado: Ollama (local) + LangChain, modelo llama3.2:1b

Asignación de rol al modelo, ej: piensa como un professional banker
Formato fijo: 4 secciones con encabezados idénticos
Contexto numérico completo: valores COP ya formateados en prompt, no solo números crudos
Validation implícita: incluye status + rejection reason, explica aprobación O rechazo

Error handling: detecta ECONNREFUSED → devuelve message claro "Ollama no disponible" 
numPredict: 1024 acota respuesta, temperature: 0.7 balance coherencia/variación
