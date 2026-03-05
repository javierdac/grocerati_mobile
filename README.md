# Grocerati Mobile

App mobile de listas de compras compartidas, construida con React Native CLI.

## Stack

- React Native CLI 0.76
- React Navigation v6 (bottom tabs + stacks)
- react-native-vector-icons (Ionicons)
- AsyncStorage para persistencia de sesion
- Axios para comunicacion con la API

## Funcionalidades

- Registro e inicio de sesion con JWT
- Crear, editar y eliminar listas
- Icono personalizable por lista (18 opciones)
- Compartir listas con codigo de invitacion
- Agregar, editar, completar y eliminar productos
- Orden alfabetico de productos
- Pull-to-refresh y polling automatico
- Skeleton loading y animaciones de entrada
- Gestion de perfil
- Splash screen personalizado (iOS y Android)

## Estructura

```
src/
  components/     # Componentes reutilizables
  navigation/     # AppNavigator con tabs y stacks
  screens/        # Login, Register, Lists, List, Profile
  services/       # API client (axios)
  config.js       # URL del backend (dev/prod)
```

## Desarrollo

```bash
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## Configuracion

En `src/config.js`:
- `USE_PRODUCTION = false` para desarrollo local
- `USE_PRODUCTION = true` para apuntar a Vercel
