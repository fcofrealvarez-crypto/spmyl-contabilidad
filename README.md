# SPMYL Contabilidad

Sistema profesional de gestión contable y financiera diseñado para pequeñas y medianas empresas en Chile.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Características Principales

### 📊 Gestión Financiera
- **Dashboard Interactivo**: Visualización en tiempo real de métricas financieras
- **Transacciones**: Registro y seguimiento de ingresos y gastos
- **Libro Mayor**: Gestión completa de asientos contables
- **Cálculo de IVA**: Automatización de cálculos tributarios
- **Reportes**: Generación de informes financieros en PDF y Excel

### 🔐 Seguridad
- Autenticación segura con Supabase
- Row Level Security (RLS) en base de datos
- Validación de entrada con Zod
- Sanitización de datos
- Cifrado HTTPS

### 💼 Características Empresariales
- Multi-usuario con aislamiento de datos
- Importación de datos desde Excel
- Exportación de reportes
- Gestión de obligaciones tributarias
- Sistema de soporte integrado

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Query
- **Validación**: Zod
- **Routing**: React Router v6

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Cuenta en Supabase (gratuita)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone <YOUR_GIT_URL>
cd spmyl-contabilidad
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de Supabase
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Configurar Base de Datos

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas de configuración de Supabase.

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

## 📦 Build de Producción

```bash
# Crear build optimizado
npm run build

# Preview del build
npm run preview
```

## 📚 Documentación

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Guía completa de despliegue
- **[SECURITY.md](./SECURITY.md)**: Documentación de seguridad
- **[Lovable Project](https://lovable.dev/projects/93d3175b-5167-42b8-b346-0a53be44300d)**: Proyecto original

## 🔒 Seguridad

Este proyecto implementa múltiples capas de seguridad:

- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Validación de entrada con Zod
- ✅ Sanitización de datos
- ✅ Protección contra XSS y SQL Injection
- ✅ Autenticación JWT con Supabase
- ✅ Variables de entorno protegidas

Ver [SECURITY.md](./SECURITY.md) para más detalles.

## 📱 Uso

### Registro e Inicio de Sesión

1. Acceder a la aplicación
2. Crear cuenta con email y contraseña segura
3. Confirmar email (si está habilitado)
4. Iniciar sesión

### Crear Transacción

1. Ir a "Transacciones"
2. Click en "Nueva Transacción"
3. Completar formulario:
   - Tipo (Ingreso/Gasto)
   - Categoría
   - Monto
   - Fecha
   - Descripción
4. Guardar

### Calcular IVA

1. Ir a "IVA"
2. Seleccionar periodo
3. El sistema calcula automáticamente:
   - IVA Débito Fiscal
   - IVA Crédito Fiscal
   - IVA a Pagar/Favor

### Generar Reportes

1. Ir a "Informes"
2. Seleccionar tipo de reporte
3. Configurar parámetros
4. Exportar en PDF o Excel

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para problemas o preguntas:

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/spmyl-contabilidad/issues)
- **Email**: soporte@tuempresa.com
- **Documentación**: Ver carpeta `/docs`

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Lovable](https://lovable.dev) - Plataforma de desarrollo

---

**Desarrollado con ❤️ para SPMYL**

