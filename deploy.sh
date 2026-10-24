#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🚀 Desplegando Golden Publicity en el VPS"
echo "=========================================="

# Ir a la ruta del proyecto en el VPS
cd /var/www/goldenpublicity

# Obtener últimos cambios
echo "📥 Descargando últimos cambios de Git..."
git pull origin main

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Compilar proyecto estático con Astro
echo "⚙️ Compilando con Astro..."
npm run build

echo "=========================================="
echo "✅ Despliegue completado exitosamente!"
echo "🌐 Sitio listo en: https://goldenpublicity.zelo.com.mx"
echo "=========================================="
