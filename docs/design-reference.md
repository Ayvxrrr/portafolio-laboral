# Referencia visual

La composición y las interacciones de esta versión recrean, por petición del
propietario del portafolio, la referencia https://josepio.netlify.app/.

Se conservan la identidad, las fotografías, los proyectos, el CV y los enlaces de
Ayvar Jose. No se reutilizan la fotografía, los proyectos ni el CV de Jose Pio.

El clip genérico de teclado `img/presentation-typing.mp4` procede de la referencia:
https://josepio.netlify.app/static/9-cebef00af2a178c7c7ed966e4bc85807-0022f.mp4

No se ha verificado una licencia independiente de ese clip. Antes de publicar
comercialmente esta versión, confirmar sus derechos o sustituirlo por un vídeo
propio. Los efectos de partículas y las interacciones se implementan localmente.

La fotografía del foco `img/light-bulb.jpg` también procede de la referencia:
https://josepio.netlify.app/static/7df7a590533fab08098ccd85f52eb535/f9913/2.jpg

Se utiliza para recrear el interruptor de iluminación solicitado. Tampoco se ha
verificado una licencia independiente de esta fotografía; confirmar sus derechos
o sustituirla por una imagen propia antes de una publicación comercial.

## Escena 3D de la referencia

Por petición explícita se incorpora también el robot usado en «Sobre mí»,
extraído del recurso público de la referencia:
https://josepio.netlify.app/b3f2613c-6a79779f8dc48e0c3089.js

Archivo local: `img/models/robot/steel-giant.glb`.
Las texturas de `img/models/robot/` proceden de:
https://josepio.netlify.app/textures/general/

Estos recursos no incluyen una licencia independiente verificada. Confirmar
sus derechos (incluidos los del personaje representado) antes de publicar
comercialmente, o sustituirlos por un modelo con licencia apropiada.

El visor usa Three.js 0.128.0 y su GLTFLoader, distribuidos bajo licencia MIT.
La licencia se conserva en `js/vendor/three/LICENSE`. El visor, las barras de
lectura y las secuencias de scroll se implementan localmente. El robot se carga
solo cuando se visita su escena; si WebGL no está disponible se conserva el
perfil y la descarga del CV como alternativa.

## Busto de partículas

`img/models/robot/particle-bust.bin` deriva del OBJ público incluido en:
https://josepio.netlify.app/7c91af51-e291eb457da3459d44bb.js

Se prepararon fuera del navegador dos subdivisiones Loop, 23 730 posiciones y
normales, para conservar la distribución ordenada de los puntos sin cargar OBJ,
subdividir geometría ni recalcular posiciones con JavaScript durante la animación.
El formato local PBT1 contiene una cabecera de 8 bytes, posiciones Float32 y normales
Int8 normalizadas. La dispersión y reconstrucción se ejecutan con un shader propio.

La licencia independiente del modelo y los derechos del personaje siguen sin
verificarse; confirmar su uso o sustituirlo por un modelo con licencia apropiada
antes de una publicación comercial.
