# Ayvarcitoo en Cloudflare Pages

La IA usa el mismo perfil, instrucciones, historial, idioma y modelo Gemini que
en Netlify. El navegador llama a `POST /api/chat`; únicamente el servidor conoce
la API key. Si la IA no está disponible, se conservan las respuestas locales.

## Publicación desde GitHub

- Repositorio: `Ayvxrrr/portafolio-laboral`.
- Rama: `main`.
- Framework: ninguno.
- Comando de compilación: `exit 0`.
- Directorio de salida: `.`.
- Directorio raíz: vacío.

Pages detecta `functions/api/chat.js` y compila la función automáticamente.
No se requiere activar compatibilidad con Node.js ni instalar dependencias.
`_routes.json` limita la ejecución de la función al chat: las imágenes, el video
y el resto del sitio se siguen sirviendo como archivos estáticos.

## Configurar Gemini

1. Abre Cloudflare → Workers & Pages → tu proyecto → Configuración
   (**Settings**) → Variables y secretos (**Variables and Secrets**).
2. Selecciona el entorno de **Producción**.
3. Añade `GEMINI_API_KEY` con tu clave de Google AI Studio. Elige tipo
   **Secreto** o **Encrypt / Cifrar**, según lo que muestre el panel.
4. Opcional: añade `GEMINI_MODEL` como texto si usabas otro modelo en Netlify.
   Si lo dejas sin configurar, se utiliza `gemini-2.5-flash`.
5. Guarda y vuelve a desplegar el último commit desde **Deployments /
   Implementaciones**. Los cambios de secretos necesitan un nuevo despliegue.
6. Recarga el portafolio, abre Ayvarcitoo y envía una pregunta. Cuando Gemini
   responda, el encabezado mostrará **En línea · IA activa**.

Los entornos de vista previa tienen variables separadas. Configura allí la clave
solo si también quieres habilitar Gemini en esos despliegues.

No pegues claves en el HTML, JavaScript público, documentación, capturas o GitHub.
La cuota de Gemini es independiente de Cloudflare; la integración no hace que
la API sea ilimitada ni garantiza que todos los modelos tengan cuota gratuita.

## Comprobación

Abrir `/api/chat` en una pestaña envía GET y devuelve un error 405; es normal.
Para comprobar una pregunta desde PowerShell, sin enviar la API key al navegador:

```powershell
$body = @{ messages = @(@{ role = 'user'; content = 'Hola, que proyectos tiene Jose?' }); language = 'es' } | ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri 'https://TU-SITIO.pages.dev/api/chat' -Method Post -ContentType 'application/json' -Body $body
```

- `503 not_configured`: falta el secreto en ese entorno o no se ha redesplegado.
- `502 upstream`: Gemini rechazó la petición; revisa la clave, el modelo y su cuota.
- `502 empty`: Gemini no devolvió una respuesta de texto.
- `502 network`: no se pudo completar la conexión con Gemini.
- Si recibes HTML en lugar de JSON, comprueba que el despliegue incluya la función.

## Desarrollo y pruebas

Pruebas automatizadas sin claves, sin llamar a Gemini y sin consumir cuota:

```powershell
node --test tests/chat.test.mjs
```

Para probar Pages Functions localmente, utiliza Node.js compatible con Wrangler:

```powershell
npx wrangler pages dev .
```

La herramienta muestra la URL local. `python -m http.server` solo sirve archivos
estáticos y no ejecuta la IA. Si necesitas una clave local, guárdala en un archivo
`.dev.vars` en la raíz con `GEMINI_API_KEY=tu_clave`; ese archivo está excluido de Git.

## Compatibilidad y alcance

- Netlify conserva `/.netlify/functions/chat`; `netlify.toml` también dirige
  `/api/chat` a esa función. Ambos proveedores reutilizan `server/chat.mjs`.
- Las respuestas del servidor del chat tienen `Cache-Control: no-store`.
- Esta adaptación no migra Netlify Forms ni las notificaciones del formulario a
  Gmail. Esos servicios requieren una configuración independiente.
