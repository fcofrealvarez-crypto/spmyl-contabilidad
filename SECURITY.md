# Documentación de Seguridad - SPMYL Contabilidad

## Resumen

Este documento describe las medidas de seguridad implementadas en la aplicación SPMYL Contabilidad para proteger los datos financieros de los usuarios.

## Autenticación

### Supabase Auth

- **Proveedor**: Supabase Authentication
- **Método**: Email + Password
- **Almacenamiento**: JWT tokens en localStorage con auto-refresh
- **Sesiones**: Persistentes con renovación automática

### Validación de Contraseñas

```typescript
// Requisitos mínimos:
- Longitud mínima: 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula  
- Al menos 1 número
- Indicador de fortaleza en tiempo real
```

### Protección de Rutas

Todas las rutas están protegidas con el componente `ProtectedRoute`:
- Verifica autenticación antes de renderizar
- Redirige a login si no hay sesión
- Muestra loading state durante verificación

## Row Level Security (RLS)

### Políticas Implementadas

Todas las tablas tienen RLS habilitado con políticas restrictivas:

#### Tabla: `transactions`
```sql
-- Los usuarios solo pueden ver sus propias transacciones
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

#### Tabla: `asientos_contables`
```sql
-- Los usuarios solo pueden modificar sus propios asientos
CREATE POLICY "Users can update their own asientos"
ON public.asientos_contables FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

#### Tabla: `cuentas`
```sql
-- Cuentas compartidas (solo lectura para usuarios)
CREATE POLICY "Las cuentas son visibles para usuarios autenticados"
ON public.cuentas FOR SELECT
TO authenticated
USING (true);
```

### Verificación de RLS

Para probar que RLS funciona correctamente:

```sql
-- Como usuario A, intentar ver datos de usuario B
SELECT * FROM transactions WHERE user_id = 'user-b-id';
-- Resultado: 0 filas (bloqueado por RLS)
```

## Validación de Entrada

### Zod Schemas

Todos los formularios usan validación con Zod:

```typescript
// Ejemplo: Validación de transacciones
export const transactionSchema = z.object({
  type: z.enum(["Ingreso", "Gasto"]),
  amount: z.number().positive().max(999999999),
  description: z.string().min(3).max(500),
  // ...
});
```

### Sanitización

Todas las entradas de usuario son sanitizadas antes de almacenarse:

```typescript
// Prevención de XSS
sanitizeText(input)
  .replace(/[<>]/g, "")
  .replace(/javascript:/gi, "")
  .replace(/on\w+=/gi, "")

// Validación de RUT chileno
sanitizeRUT(rut)
  .replace(/[^0-9K-]/g, "")
  .format("12345678-9")
```

## Protección de Credenciales

### Variables de Entorno

```bash
# ❌ NUNCA hacer esto:
git add .env
git commit -m "Add credentials"

# ✅ SIEMPRE:
# 1. .env está en .gitignore
# 2. Usar .env.example como plantilla
# 3. Configurar variables en Vercel/hosting
```

### Archivo .gitignore

```text
# Environment variables - CRITICAL
.env
.env.local
.env.production.local
```

## Manejo de Errores

### Sistema Centralizado

```typescript
// No exponer detalles técnicos al usuario
handleError(error) {
  // Log técnico (solo en desarrollo)
  console.error(error);
  
  // Mensaje amigable al usuario
  toast.error("Error al procesar la solicitud");
}
```

### Mensajes de Error

- ❌ "Database connection failed at line 42"
- ✅ "Error al procesar la información. Intenta nuevamente."

## Prevención de Ataques

### SQL Injection

**Protección**: Supabase usa consultas parametrizadas automáticamente

```typescript
// ✅ Seguro (parametrizado)
supabase.from('transactions').select('*').eq('id', userId)

// ❌ Vulnerable (nunca hacer)
supabase.rpc('raw_sql', { query: `SELECT * FROM transactions WHERE id = ${userId}` })
```

### XSS (Cross-Site Scripting)

**Protección**: 
1. React escapa HTML automáticamente
2. Sanitización adicional de inputs
3. CSP headers en producción

```typescript
// Sanitización de texto
const clean = sanitizeText(userInput)
  .replace(/[<>]/g, "")
  .substring(0, 1000);
```

### CSRF (Cross-Site Request Forgery)

**Protección**: 
- Supabase valida tokens JWT en cada request
- SameSite cookies
- Origin validation

## Auditoría y Logging

### Logs de Autenticación

Supabase registra automáticamente:
- Intentos de login
- Registros de usuarios
- Cambios de contraseña
- Sesiones activas

### Logs de Base de Datos

Accesibles en Supabase Dashboard:
- Queries ejecutadas
- Errores de RLS
- Violaciones de políticas

## Backups y Recuperación

### Backups Automáticos

Supabase realiza backups diarios automáticos:
- Retención: 7 días (plan gratuito)
- Retención: 30 días (plan pro)

### Backup Manual

```bash
# Exportar base de datos
supabase db dump -f backup-$(date +%Y%m%d).sql

# Restaurar desde backup
supabase db reset
psql -h db.xxx.supabase.co -U postgres -f backup.sql
```

## Cumplimiento y Privacidad

### GDPR Compliance

- ✅ Derecho al olvido: Usuarios pueden eliminar su cuenta
- ✅ Portabilidad de datos: Exportación de datos en JSON
- ✅ Consentimiento: Aceptación de términos en registro
- ✅ Cifrado: Datos en tránsito (HTTPS) y en reposo

### Datos Almacenados

```typescript
// Información personal mínima
{
  email: string,           // Requerido para autenticación
  nombre: string?,         // Opcional
  empresa: string?,        // Opcional
  // NO almacenamos: tarjetas, cuentas bancarias
}
```

## Mejores Prácticas

### Para Desarrolladores

1. **Nunca** commitear credenciales
2. **Siempre** validar entrada de usuario
3. **Siempre** sanitizar datos antes de guardar
4. **Usar** políticas RLS en todas las tablas
5. **Revisar** logs regularmente

### Para Usuarios

1. Usar contraseñas fuertes (8+ caracteres, mayúsculas, números)
2. No compartir credenciales
3. Cerrar sesión en dispositivos compartidos
4. Reportar actividad sospechosa

## Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:

1. **NO** crear un issue público
2. Enviar email a: security@tuempresa.com
3. Incluir:
   - Descripción del problema
   - Pasos para reproducir
   - Impacto potencial

## Actualizaciones de Seguridad

### Dependencias

```bash
# Verificar vulnerabilidades
npm audit

# Actualizar dependencias
npm update

# Actualizar dependencias con vulnerabilidades
npm audit fix
```

### Monitoreo Continuo

- Dependabot habilitado en GitHub
- Alertas de seguridad automáticas
- Revisión mensual de dependencias

## Checklist de Seguridad

### Pre-Despliegue

- [ ] `.env` en `.gitignore`
- [ ] Variables de entorno en Vercel
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas RLS probadas
- [ ] Validación de formularios implementada
- [ ] Sanitización de inputs implementada
- [ ] Error handling centralizado
- [ ] HTTPS habilitado

### Post-Despliegue

- [ ] Verificar autenticación funciona
- [ ] Probar RLS con múltiples usuarios
- [ ] Revisar logs de Supabase
- [ ] Configurar alertas de errores
- [ ] Documentar credenciales de forma segura
- [ ] Habilitar 2FA en cuentas admin

## Recursos Adicionales

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/security)

---

**Última actualización**: 2025-11-21  
**Próxima revisión**: 2026-02-21
