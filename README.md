# Acreditación Online — Profesores de Religión Católica

Réplica funcional del sistema de acreditación online, construida con **Next.js 14 (App Router)**
y base de datos **Postgres (Neon, vía Vercel Marketplace)**. Incluye:

- **Inicio** (`/`): las 3 opciones (Renovación, Estado de solicitud, Verificar certificados).
- **Renovación de Certificado** (`/renovacion`): formulario con datos personales, establecimientos
  dinámicos (agregar/eliminar) y detección automática de la **Diócesis** según la(s) comuna(s) del
  o los establecimientos (con las 346 comunas de Chile mapeadas a sus 26 jurisdicciones
  eclesiásticas territoriales reales). Valida que todos los establecimientos pertenezcan a la
  misma diócesis, igual que el sistema original.
- **Revisar estado de solicitud** (`/estado`): búsqueda real por RUT contra la base de datos.
- **Verificar certificados** (`/verificar`): valida un código de 8 caracteres contra los
  certificados realmente aprobados.
- **Panel de administración** (`/admin`, no estaba en las capturas pero es necesario para que el
  sistema sea funcional de extremo a extremo): permite revisar las solicitudes, aprobarlas
  (genera el código de verificación real y la fecha de vencimiento a 1 año) o rechazarlas.

El RUT chileno se valida con el algoritmo de dígito verificador (módulo 11).

## Estructura

```
app/
  page.js              → Inicio (3 tarjetas)
  renovacion/page.js   → Formulario de renovación
  estado/page.js       → Revisión de estado por RUT
  verificar/page.js    → Verificación de certificados
  admin/page.js        → Panel de administración
  api/...               → Endpoints (crear/buscar solicitudes, verificar, admin)
lib/
  comunas.js, comunas_data.json → 346 comunas de Chile + diócesis correspondiente
  rut.js                → Validación/formato de RUT
  validacion.js         → Validación del formulario en el servidor
  db.js                 → Conexión a Postgres (Neon)
scripts/
  schema.sql, init-db.mjs → Esquema de base de datos e inicialización
```

## 1. Desplegar en Vercel

1. Sube esta carpeta a un repositorio de GitHub (o usa `vercel deploy` directamente desde aquí
   con la CLI de Vercel).
2. Importa el repositorio en [vercel.com/new](https://vercel.com/new). Vercel detecta Next.js
   automáticamente — no se requiere configuración adicional de build.
3. **Agrega la base de datos:** en el proyecto de Vercel ve a **Storage → Marketplace → Neon
   (Postgres)** y créala. Esto inyecta automáticamente la variable `DATABASE_URL`.
4. **Agrega la contraseña de administrador:** en **Settings → Environment Variables**, agrega
   `ADMIN_PASSWORD` con la clave que quieras usar para entrar a `/admin`.
5. Vuelve a desplegar (Redeploy) para que tome las nuevas variables de entorno.
6. **Inicializa las tablas** (una sola vez): en tu computador, con la
   [Vercel CLI](https://vercel.com/docs/cli) instalada:
   ```bash
   npm install
   vercel link              # vincula esta carpeta a tu proyecto de Vercel
   vercel env pull .env.local
   npm run db:init           # crea las tablas solicitudes / establecimientos
   ```
   También puedes ejecutar el contenido de `scripts/schema.sql` directamente desde el
   **Query editor** de Neon o del dashboard de Vercel (Storage → tu base → Query).

Listo: tu sitio queda funcionando en `https://tu-proyecto.vercel.app`, con formularios que
guardan datos reales, búsqueda por RUT y verificación de certificados.

## 2. Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # completa DATABASE_URL y ADMIN_PASSWORD
npm run db:init                    # crea las tablas
npm run dev                        # http://localhost:3000
```

## Notas sobre la asignación de Diócesis

El mapeo comuna → diócesis se construyó a partir de la división político-administrativa oficial
de Chile (346 comunas) y la organización eclesiástica vigente (5 arquidiócesis, 19 diócesis, 1
prelatura territorial y 1 vicariato apostólico). En la Región de la Araucanía se distinguió entre
la Diócesis de Temuco y la Diócesis de Villarrica dentro de la provincia de Cautín. Si necesitas
ajustar algún límite, edítalo directamente en `lib/comunas_data.json` (campo `diocesis` de cada
comuna) — no requiere tocar el código.

## Seguridad del panel admin

El panel `/admin` usa una contraseña compartida (`ADMIN_PASSWORD`) enviada en cada solicitud vía
encabezado HTTP. Es un mecanismo simple pensado para un equipo pequeño; si necesitas cuentas
individuales o roles, lo natural es agregar más adelante un proveedor de autenticación (p. ej.
NextAuth) — la lógica de aprobación/rechazo ya está separada en `app/api/admin/*` para facilitarlo.
