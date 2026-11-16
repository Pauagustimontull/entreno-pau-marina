# Entreno · Pau y Marina

App web (Angular 19 + Firebase) con los dos planes de entrenamiento y un selector **Pau ↔ Marina** arriba.
Los datos se guardan en Firestore, así que se sincronizan entre móviles y ordenadores. Además funciona **sin cobertura**: guarda en el móvil y sube los cambios en cuanto vuelve la conexión.

- **Pau:** gimnasio de lunes a viernes, registro de pesos con recomendación de progresión, fases de 9 semanas, cronómetro de descanso y progreso (peso, cintura, calendario, marcas).
- **Marina:** carrera de 0 a 7–8 km con temporizador de intervalos, rutinas en casa guiadas, semana adaptada al baloncesto, guía de comida y progreso (medidas, carreras, constancia).

---

## 1. Firebase

**Ya está configurado:** proyecto `entreno-pau-marina`, login con Google activado, Firestore en Madrid (`europe-southwest1`) y reglas publicadas.
Solo falta poner el correo de Marina en `firestore.rules` y en *Firestore → Reglas* de la consola.

Pasos por si algún día hay que montarlo de cero:


1. Entra en <https://console.firebase.google.com> y crea un proyecto (puedes desactivar Analytics).
2. **Añadir app web** (icono `</>`). Ponle un nombre y copia el objeto `firebaseConfig` que te enseña.
   Pégalo en `src/environments/firebase.config.ts`.
3. **Authentication → Comenzar → Método de inicio de sesión → Google → Habilitar.**
4. **Firestore Database → Crear base de datos →** modo producción, ubicación en Europa (por ejemplo `eur3` o `europe-southwest1`).
5. **Firestore → Reglas:** copia el contenido de `firestore.rules` y **cambia los dos correos** por los vuestros
   (los de Google con los que vais a entrar). Pulsa *Publicar*.
   Solo esas dos cuentas podrán leer y escribir.

## 2. Probar en local

Hace falta Node 20 o superior.

```bash
npm install
npm start          # abre http://localhost:4200
```

`localhost` ya viene autorizado en Firebase para el login.

## 3. Subir a Netlify

**Opción A, con GitHub (se actualiza sola con cada push):**

1. Sube la carpeta a un repositorio de GitHub.
2. En Netlify: *Add new site → Import an existing project →* elige el repo.
   Netlify lee `netlify.toml` y ya sabe que tiene que ejecutar `npm run build` y publicar `dist/entreno/browser`.

**Opción B, arrastrando la carpeta:**

```bash
npm run build
```

Arrastra la carpeta `dist/entreno/browser` a <https://app.netlify.com/drop>.

**Importante:** en Firebase ve a **Authentication → Configuración → Dominios autorizados** y añade el dominio de Netlify
(por ejemplo `entreno-pau-marina.netlify.app`). Sin esto, el botón de «Entrar con Google» falla en la web publicada.

## 4. Pasar los datos que ya tenéis

En las páginas que estáis usando ahora: **Progreso → Copia de seguridad → Copiar mis datos**.
En la app nueva, entra en el perfil correspondiente y pega la copia en **Progreso → Importar copia** (dos pulsaciones para confirmar).

## 5. Instalarla en el móvil

Abre la web en el móvil → *Compartir* (iPhone) o menú ⋮ (Android) → **Añadir a pantalla de inicio**.
Se abre a pantalla completa como una app.

---

## Estructura

```
src/
  app/
    app.component.ts     Login con Google, selector Pau/Marina, carga del plan
    profile-store.ts     Datos de cada perfil en Firestore: profiles/{pau|marina}/docs/{documento}
    firebase.ts          Inicialización (Auth + Firestore con caché offline)
  core/
    engine.ts            Motor de las figuras animadas (SVG)
    pau.ts               Plan de Pau (montado en un Shadow DOM)
    marina.ts            Plan de Marina (montado en un Shadow DOM)
    store.ts             Interfaz de datos que usan los planes (+ versión localStorage para pruebas)
  environments/firebase.config.ts
firestore.rules          Reglas de seguridad (solo vuestros dos correos)
netlify.toml             Build y redirección SPA para Netlify
```

Angular se encarga del login, los perfiles, el tema de cada uno y la sincronización. Los planes (`core/pau.ts` y `core/marina.ts`) son el código ya probado de la primera versión: generan su HTML dentro de un Shadow DOM para que los estilos no choquen. Por eso llevan `// @ts-nocheck`.
Si más adelante queréis pasar alguna pantalla a componentes de Angular, se puede hacer poco a poco: cada plan solo necesita un `CoreStore` (`get`, `set`, `all`, `subscribe`).

### Modelo de datos (Firestore)

| Documento | Contenido |
|---|---|
| `meta` | fecha de inicio, nivel; en Marina también los días de baloncesto y el partido |
| `sessions` | por fecha: qué se ha hecho ese día y la nota |
| `body` | medidas (peso, cintura…) |
| `ex-L-0`, `ex-M-1`… | (Pau) historial de pesos y repeticiones de cada ejercicio |
| `runs` | (Marina) carreras hechas, km y sensaciones |
