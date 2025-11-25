# Guía de Despliegue - SPMYL Contabilidad

## Requisitos Previos

- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com) (opcional, recomendado)
- Node.js 18+ instalado localmente
- Git instalado

## Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ir a [https://app.supabase.com](https://app.supabase.com)
2. Crear nuevo proyecto
3. Anotar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGci...`

### 2. Ejecutar Migraciones de Base de Datos

**Opción A: Desde el Dashboard de Supabase**

1. Ir a `SQL Editor` en el dashboard
2. Ejecutar los archivos SQL en orden:
   - `supabase/migrations/20251030225411_940eb56b-f5b6-4892-b1e7-947d4f6a7118.sql`
   - `supabase/migrations/20251121000000_create_missing_tables.sql`

**Opción B: Usando Supabase CLI**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular proyecto
supabase link --project-ref your-project-ref

# Aplicar migraciones
supabase db push
```

### 3. Verificar Tablas Creadas

En el dashboard de Supabase, ir a `Table Editor` y verificar que existan:
- ✅ `cuentas`
- ✅ `asientos_contables`
- ✅ `transactions`
- ✅ `iva_records`
- ✅ `obligations`
- ✅ `soporte`
- ✅ `usuarios`

### 4. Configurar Autenticación

1. Ir a `Authentication` → `Settings`
2. Configurar:
   - **Site URL**: URL de tu aplicación en producción
   - **Redirect URLs**: Agregar URLs permitidas
3. Habilitar proveedores de autenticación (Email por defecto)

## Despliegue en Vercel

### 1. Preparar Repositorio

```bash
# Asegurarse de que .env NO esté en git
git status

# Si .env aparece, eliminarlo del repositorio
git rm --cached .env
git commit -m "Remove .env from repository"
git push
```

### 2. Conectar con Vercel

1. Ir a [https://vercel.com](https://vercel.com)
2. Importar proyecto desde GitHub
3. Configurar variables de entorno:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

4. Deploy

### 3. Configurar Dominio Personalizado (Opcional)

1. En Vercel, ir a `Settings` → `Domains`
2. Agregar dominio personalizado
3. Configurar DNS según instrucciones

## Despliegue Manual (Alternativa)

### 1. Build Local

```bash
# Instalar dependencias
npm install

# Crear archivo .env con tus credenciales
cp .env.example .env
# Editar .env con tus valores reales

# Build de producción
npm run build
```

### 2. Desplegar Carpeta `dist`

La carpeta `dist/` contiene los archivos estáticos. Puedes desplegarlos en:
- **Netlify**: Arrastra la carpeta `dist` al dashboard
- **GitHub Pages**: Usa `gh-pages` branch
- **Servidor propio**: Copia archivos a `/var/www/html`

## Configuración Post-Despliegue

### 1. Actualizar Site URL en Supabase

1. Ir a Supabase Dashboard → `Authentication` → `URL Configuration`
2. Actualizar:
   - **Site URL**: `https://tu-dominio.com`
   - **Redirect URLs**: `https://tu-dominio.com/**`

### 2. Crear Usuario Admin Inicial

```sql
-- Ejecutar en SQL Editor de Supabase
-- Reemplazar con email real
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@tuempresa.com', crypt('password123', gen_salt('bf')), now());
```

### 3. Verificar Funcionalidad

- [ ] Registro de nuevo usuario
- [ ] Login
- [ ] Crear transacción
- [ ] Ver dashboard
- [ ] Calcular IVA
- [ ] Generar reporte

## Mantenimiento

### Backups Automáticos

Supabase hace backups automáticos, pero puedes configurar adicionales:

```bash
# Backup manual de base de datos
supabase db dump -f backup.sql
```

### Actualizar Aplicación

```bash
# Pull últimos cambios
git pull origin main

# Reinstalar dependencias si es necesario
npm install

# Vercel desplegará automáticamente
```

### Monitoreo

1. **Supabase Dashboard**: Ver logs de base de datos
2. **Vercel Analytics**: Ver tráfico y errores
3. **Sentry** (opcional): Configurar para error tracking

## Solución de Problemas

### Error: "Invalid login credentials"

- Verificar que el email esté confirmado en Supabase
- Revisar políticas RLS en las tablas

### Error: "Failed to fetch"

- Verificar que CORS esté configurado en Supabase
- Verificar que las variables de entorno estén correctas

### Tablas no aparecen

- Verificar que las migraciones se ejecutaron correctamente
- Revisar logs en Supabase SQL Editor

## Seguridad en Producción

### ✅ Checklist de Seguridad

- [ ] `.env` NO está en el repositorio
- [ ] Variables de entorno configuradas en Vercel
- [ ] RLS habilitado en todas las tablas
- [ ] HTTPS habilitado (automático en Vercel)
- [ ] Políticas RLS probadas
- [ ] Rate limiting configurado (Supabase lo hace automáticamente)

### Recomendaciones Adicionales

1. **Habilitar 2FA** en Supabase y Vercel
2. **Rotar credenciales** cada 90 días
3. **Monitorear logs** regularmente
4. **Backups semanales** de base de datos

## Soporte

Para problemas técnicos:
- Documentación Supabase: https://supabase.com/docs
- Documentación Vercel: https://vercel.com/docs
- Issues del proyecto: [GitHub Issues]

---

**Última actualización**: 2025-11-21
