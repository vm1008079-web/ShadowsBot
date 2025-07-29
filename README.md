# Michi-WaBot

Un bot sencillo para WhatsApp hecho con cariño.  
Funciona rápido y busca ser útil para quien lo use.

---

## Instalación en Termux

Ejecuta estos pasos en orden:

```bash
# 1. Permitir acceso al almacenamiento
termux-setup-storage

# 2. Actualizar paquetes e instalar dependencias
apt update && apt upgrade && pkg install -y git nodejs ffmpeg imagemagick

# 3. Clonar el repositorio
git clone https://github.com/Ado-rgb/Michi-WaBot

# 4. Entrar a la carpeta del bot
cd Michi-WaBot

# 5. Instalar dependencias
npm install

# 6. Iniciar el bot
npm start