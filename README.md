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

### Vista «Juntos 🏆»

Tercera opción del selector de arriba. Lee los datos de los dos perfiles:

- **👫 Pareja:** el reto de la semana (Pau 4+ días de gym y Marina 4+ días activos), anillos de progreso, marcador, ánimos para el otro y muro de actividad reciente (entrenos, récords, carreras, rutinas y logros).
- **🏆 Logros:** unos 70 logros de Pau, de Marina y de pareja, con barra de progreso, fecha de cuándo se consiguieron y confeti al desbloquear nuevos.
- **📊 Rendimiento:** días por semana, volumen en toneladas, 1RM estimado de los ejercicios principales y lo que más ha mejorado (Pau); minutos corriendo, avance del plan de carrera, rutinas y medidas (Marina).
- **💌 Ánimos:** se guardan en `profiles/{perfil}/docs/cheers` del que los recibe. Al abrir su perfil o la vista Juntos, le sale un aviso arriba.

Todo se calcula en el navegador a partir de los documentos que ya existen (`src/core/juntos.ts`), así que los logros cuentan también lo apuntado antes.

### Mejoras de entreno

- **Pau, registro serie a serie:** cada serie tiene su peso, sus reps y su RIR (las reps que quedaban en recámara). La recomendación tiene en cuenta el RIR.
- **Aviso de estancamiento:** si un ejercicio lleva 3 sesiones sin mejorar (máximo estimado de la sesión), propone bajar un 10 %, cambiar de variante o descansar más.
- **Gráfica por ejercicio:** botón «📈 Ver progreso» y filas de *Progreso*. Muestra el peso de trabajo, el 1RM estimado y el volumen de cada sesión.
- **Resumen semanal:** sale en *Progreso*, y como aviso los domingos, lunes y martes, para los dos.
- **Discos por lado** para la barra (20 kg, o 10 kg la Z) y **series de aproximación** con pesos calculados.
- **Variantes** («🔄 Cambiar») cuando la máquina está ocupada. Cada variante guarda su historial aparte (`ex-L-0@mancuernas`).
- **Marina, carreras con GPS:** distancia y ritmo medio en directo durante el temporizador. Al acabar se apuntan los km, los minutos y el ritmo.
- **Nivel adaptativo:** al acabar cada rutina pregunta qué tal ha ido. Dos «fácil» seguidos suben de nivel (hasta el 4) y dos «muy dura» lo bajan.

### Notificaciones (Firebase Cloud Messaging + Netlify Functions)

- `public/firebase-messaging-sw.js`: service worker que muestra los avisos.
- `src/app/push.ts`: pide permiso y guarda el token del dispositivo en `profiles/{perfil}/docs/push`.
- `netlify/functions/avisar.mts`: envía al otro los ánimos y los eventos (récords, carreras, rutinas, subidas de nivel). Comprueba el token de Firebase de quien envía.
- `netlify/functions/recordatorio.mts`: función programada, cada día a las 16:00 UTC (17:00 en Madrid en invierno). Avisa si ese día toca entrenar y no hay nada marcado.

**Para activarlas hacen falta dos claves:**
1. **Clave VAPID (pública):** Firebase → Configuración del proyecto → Cloud Messaging → *Certificados web push* → «Generar par de claves». Va en `src/environments/push.config.ts`.
2. **Cuenta de servicio (secreta, nunca en el repo):** Firebase → Configuración del proyecto → Cuentas de servicio → «Generar nueva clave privada». Pega el contenido del JSON en Netlify → *Project configuration → Environment variables* como `FIREBASE_SERVICE_ACCOUNT`. Después, vuelve a desplegar.

En iPhone los avisos solo funcionan con la web añadida a la pantalla de inicio (iOS 16.4 o posterior).

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
    juntos.ts            Vista Juntos: logros, rendimiento, pareja y ánimos
  app/push.ts            Notificaciones: permiso, token del dispositivo y avisos al otro
netlify/functions/       avisar (ánimos y eventos) y recordatorio (programada)
public/firebase-messaging-sw.js  Service worker de las notificaciones
    catalog-pau.ts       Catálogo de ejercicios de Pau (para logros y estadísticas)
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
