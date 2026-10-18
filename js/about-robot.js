(() => {
    'use strict';
    const scripts = new Map();
    function loadScript(source) {
        if (scripts.has(source)) return scripts.get(source);
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = source; script.onload = resolve; script.onerror = () => reject(new Error(`No se pudo cargar ${source}`));
            document.head.append(script);
        });
        scripts.set(source, promise);
        return promise;
    }
    async function create(canvas, getQuality) {
        await loadScript('js/vendor/three/three.min.js');
        await loadScript('js/vendor/three/GLTFLoader.js');
        const THREE = window.THREE;
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = .95;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(0x000000, 0);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 1, 200);
        camera.position.set(0, 0, 10);
        const outer = new THREE.Group(); outer.position.y = -4; scene.add(outer);
        const follow = new THREE.Group(); outer.add(follow);
        scene.add(new THREE.HemisphereLight(0xdce6f2, 0x302a25, .28));
        const point = new THREE.PointLight(0xfff1db, .85); point.position.set(.37, 3.2, 3.5); follow.add(point);
        const spot = new THREE.SpotLight(0xfff5e8, 6, 60, Math.PI / 4, .65, 1);
        spot.position.set(-4, 8, 6); spot.target.position.set(0, 0, -6);
        spot.castShadow = true;
        spot.shadow.bias = -.0001; spot.shadow.normalBias = .025;
        spot.shadow.camera.near = .5; spot.shadow.camera.far = 50;
        follow.add(spot); follow.add(spot.target);
        const rim = new THREE.DirectionalLight(0xd9e5f5, .6); rim.position.set(5, 3, -8); follow.add(rim);
        const textureLoader = new THREE.TextureLoader();
        const textures = {};
        let gltf;
        try {
            [gltf] = await Promise.all([
                new Promise((resolve, reject) => new THREE.GLTFLoader().load('img/models/robot/steel-giant.glb', resolve, undefined, reject)),
                ...['map', 'emissive', 'normal', 'roughness', 'metalness'].map(name => new Promise((resolve, reject) => textureLoader.load(`img/models/robot/${name}.webp`, texture => {
                    // Estos atlas van con flipY=true; invertirlos descoloca los ojos y el metal xd.
                    texture.flipY = true;
                    if (name === 'map' || name === 'emissive') texture.encoding = THREE.sRGBEncoding;
                    textures[name] = texture; resolve(texture);
                }, undefined, reject)))
            ]);
        } catch (error) {
            Object.values(textures).forEach(texture => texture.dispose()); renderer.dispose(); throw error;
        }
        let geometry;
        gltf.scene.traverse(object => { if (!geometry && object.isMesh) geometry = object.geometry; });
        if (!geometry) { renderer.dispose(); throw new Error('El modelo no contiene geometría'); }
        gltf.scene.traverse(object => {
            if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
        });

        // Genero los reflejos una vez para no cargar un HDR ni repetir ese trabajo xd.
        const studio = new THREE.Scene(); studio.background = new THREE.Color(0x202126);
        [
            { position: [-6, 6, 7], size: [6, 10], color: [3, 2.8, 2.5] },
            { position: [7, 3, -3], size: [3, 8], color: [1.5, 1.7, 2] },
            { position: [0, 10, 0], size: [8, 8], color: [2, 2, 2] }
        ].forEach(({ position, size, color }) => {
            const panel = new THREE.Mesh(new THREE.PlaneGeometry(...size), new THREE.MeshBasicMaterial({ color: new THREE.Color(...color), side: THREE.DoubleSide }));
            panel.position.set(...position); panel.lookAt(0, 0, 0); studio.add(panel);
        });
        const pmrem = new THREE.PMREMGenerator(renderer);
        const environment = pmrem.fromScene(studio, .05, .1, 50);
        scene.environment = environment.texture;
        pmrem.dispose();
        studio.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });

        const material = new THREE.MeshStandardMaterial({ color: 0x6e6b65, map: textures.map, emissive: 0xffdd00, emissiveMap: textures.emissive, emissiveIntensity: 1.2, normalMap: textures.normal, normalScale: new THREE.Vector2(.75, .75), roughnessMap: textures.roughness, metalnessMap: textures.metalness, roughness: .7, metalness: .85, envMapIntensity: .65 });
        const robot = new THREE.Mesh(geometry, material); follow.add(robot);
        let width = 0, height = 0, quality = '', last = 0, rendered = false;
        const pose = { x: 2.6, y: -8.77, z: -8.47, rx: .39, ry: -1.09 };
        const mix = (a, b, t) => a + (b - a) * t;
        function render({ progress = 0, pointerX = 0, pointerY = 0, motion = true, visible = true, now = performance.now(), force = false } = {}) {
            if (!visible || document.hidden || renderer.getContext().isContextLost()) return false;
            const selected = getQuality();
            const rect = canvas.getBoundingClientRect();
            const nextWidth = Math.max(1, Math.round(rect.width)), nextHeight = Math.max(1, Math.round(rect.height));
            if (nextWidth !== width || nextHeight !== height || selected !== quality) {
                width = nextWidth; height = nextHeight; quality = selected;
                renderer.setPixelRatio(Math.min(devicePixelRatio || 1, quality === 'low' ? 1 : quality === 'high' ? 2 : 1.5));
                renderer.setSize(width, height, false);
                camera.aspect = width / height; camera.updateProjectionMatrix();
                // Bajo resolución y sombras, pero no quito el relieve ni los ojos xd.
                renderer.shadowMap.enabled = quality !== 'low';
                robot.castShadow = robot.receiveShadow = renderer.shadowMap.enabled;
                const shadowSize = quality === 'high' ? 2048 : 1024;
                if (spot.shadow.mapSize.x !== shadowSize) {
                    spot.shadow.map?.dispose(); spot.shadow.map = null;
                    spot.shadow.mapSize.set(shadowSize, shadowSize);
                }
                const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), quality === 'low' ? 1 : quality === 'high' ? 8 : 4);
                Object.values(textures).forEach(texture => { texture.anisotropy = anisotropy; texture.needsUpdate = true; });
                force = true;
            }
            const interval = quality === 'low' ? 33 : 16;
            if (!force && rendered && now - last < interval) return motion;
            const alpha = !motion || !rendered ? 1 : .15;
            pose.x = mix(pose.x, mix(2.6, -3.33, progress), alpha);
            pose.y = mix(pose.y, mix(-8.77, -10.77, progress), alpha);
            pose.z = mix(pose.z, mix(-8.47, -4, progress), alpha);
            pose.rx = mix(pose.rx, mix(.39, .06, progress), alpha);
            pose.ry = mix(pose.ry, mix(-1.09, -5, progress), alpha);
            robot.position.set(pose.x, pose.y, pose.z);
            robot.rotation.set(pose.rx, pose.ry, progress * .01);
            follow.rotation.y = mix(follow.rotation.y, motion ? pointerX * Math.PI / 10 : 0, motion ? .06 : 1);
            spot.position.set(-4 + (motion ? pointerX * 3 : 0), 8 + (motion ? pointerY * 2 : 0), 6);
            renderer.render(scene, camera);
            rendered = true; last = now;
            canvas.dataset.robotProgress = progress.toFixed(3);
            canvas.dataset.quality = quality;
            return motion;
        }
        return { render, dispose() { geometry.dispose(); material.dispose(); Object.values(textures).forEach(texture => texture.dispose()); environment.dispose(); spot.shadow.map?.dispose(); renderer.dispose(); } };
    }

    async function createParticles(canvas, getQuality, invalidate = () => {}) {
        const [, response] = await Promise.all([loadScript('js/vendor/three/three.min.js'), fetch('img/models/robot/particle-bust.bin')]);
        if (!response.ok) throw new Error('No se pudo cargar el busto de partículas.');
        const buffer = await response.arrayBuffer(), header = new DataView(buffer);
        // PBT1: 8 bytes de cabecera, posiciones Float32 y normales Int8 normalizadas xd.
        if (buffer.byteLength < 8 || header.getUint32(0, false) !== 0x50425431) throw new Error('Formato de partículas no válido.');
        const count = header.getUint32(4, true);
        if (!count || buffer.byteLength !== 8 + count * 15) throw new Error('El busto de partículas está incompleto.');
        const THREE = window.THREE;
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
        renderer.setClearColor(0x000000, 0); renderer.sortObjects = false;
        const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(43, 1, .1, 40);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffer, 8, count * 3), 3));
        geometry.setAttribute('aNormal', new THREE.BufferAttribute(new Int8Array(buffer, 8 + count * 12, count * 3), 3, true));
        // La GPU mueve los puntos en un solo dibujo, sin recalcularlos en JS xd.
        const material = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            uniforms: {
                uPointer: { value: new THREE.Vector2() }, uInteraction: { value: 0 },
                uRotation: { value: 0 }, uTilt: { value: 0 },
                uPixelRatio: { value: 1 }, uAspect: { value: 1 }, uHeight: { value: 600 }
            },
            vertexShader: `
                attribute vec3 aNormal;
                uniform vec2 uPointer;
                uniform float uInteraction, uRotation, uTilt, uPixelRatio, uAspect, uHeight;
                varying float vAlpha;
                void main() {
                    float c = cos(uRotation), s = sin(uRotation), ct = cos(uTilt), st = sin(uTilt);
                    vec3 point = position, facing = aNormal;
                    point.xz = vec2(c * point.x - s * point.z, s * point.x + c * point.z);
                    facing.xz = vec2(c * facing.x - s * facing.z, s * facing.x + c * facing.z);
                    point.yz = vec2(ct * point.y - st * point.z, st * point.y + ct * point.z);
                    facing.yz = vec2(ct * facing.y - st * facing.z, st * facing.y + ct * facing.z);
                    vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);
                    vec4 clipPosition = projectionMatrix * viewPosition;
                    vec2 delta = (clipPosition.xy / clipPosition.w - uPointer) * vec2(uAspect, 1.0);
                    float influence = (1.0 - smoothstep(0.02, 0.48, length(delta))) * uInteraction;
                    float seed = fract(dot(position, vec3(13.73, 27.19, 8.51)));
                    vec3 direction = normalize(vec3(delta, (seed - 0.5) * 0.3) + vec3(0.0001));
                    point += direction * influence * (0.95 + seed * 0.35);
                    viewPosition = modelViewMatrix * vec4(point, 1.0);
                    gl_Position = projectionMatrix * viewPosition;
                    float size = clamp(1.3 * uHeight / 600.0 * 8.0 / max(1.0, -viewPosition.z), 0.8, 1.6);
                    gl_PointSize = max(1.0, size * uPixelRatio);
                    vAlpha = mix(0.4, 1.0, smoothstep(-0.65, 0.65, facing.z));
                }
            `,
            fragmentShader: `
                varying float vAlpha;
                void main() {
                    float radius = length(gl_PointCoord - vec2(0.5));
                    float alpha = (1.0 - smoothstep(0.35, 0.5, radius)) * vAlpha;
                    if (alpha < 0.02) discard;
                    gl_FragColor = vec4(vec3(1.0), alpha);
                }
            `
        });
        const robot = new THREE.Points(geometry, material); robot.frustumCulled = false; scene.add(robot);
        const presets = { low: { points: 11000, ratio: 1.25 }, medium: { points: 20000, ratio: 1.75 }, high: { points: count, ratio: 2 } };
        const pose = { pointerX: 0, pointerY: 0, interaction: 0, rotation: -.35, tilt: 0 };
        let width = 0, height = 0, sizeDirty = true, quality = '', density = 1, resolution = 1;
        let rendered = false, disposed = false, last = 0, clock = 0, frames = 0, telemetryAt = 0, fps = 0;
        let sampleTime = 0, sampleFrames = 0, sampleElapsed = 0;
        function resize() { sizeDirty = true; invalidate(); }
        const observer = 'ResizeObserver' in window ? new ResizeObserver(entries => {
            const rect = entries[0].contentRect;
            if (rect.width > 0 && rect.height > 0) { width = Math.round(rect.width); height = Math.round(rect.height); resize(); }
        }) : null;
        observer?.observe(canvas);
        function configure() {
            if (!width || !height || !observer) {
                const rect = canvas.getBoundingClientRect(); width = Math.max(1, Math.round(rect.width)); height = Math.max(1, Math.round(rect.height));
            }
            const preset = presets[quality];
            const ratio = Math.min(devicePixelRatio || 1, preset.ratio * resolution);
            if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.position.set(-.18, 0, Math.max(6.85, 4.1 / camera.aspect) / (2 * Math.tan(THREE.MathUtils.degToRad(43 / 2))));
            camera.updateProjectionMatrix();
            geometry.setDrawRange(0, Math.max(1, Math.floor(Math.min(count, preset.points) * density)));
            material.uniforms.uPixelRatio.value = ratio;
            material.uniforms.uAspect.value = camera.aspect;
            material.uniforms.uHeight.value = height;
            sizeDirty = false;
        }
        function render({ progress = .5, pointerX = 0, pointerY = 0, pointerActive = false, motion = true, visible = true, now = performance.now() } = {}) {
            if (disposed || !visible || document.hidden || renderer.getContext().isContextLost()) { last = 0; return false; }
            const requested = getQuality(), selected = Object.hasOwn(presets, requested) ? requested : 'medium';
            if (quality !== selected) { quality = selected; density = resolution = 1; sampleTime = sampleFrames = sampleElapsed = 0; sizeDirty = true; }
            if (sizeDirty) configure();
            const rawElapsed = last ? now - last : 0;
            const elapsed = rawElapsed > 0 && rawElapsed < 150 ? Math.min(64, rawElapsed) : 16.67;
            last = now;
            if (motion) clock += elapsed / 1000;
            const ease = !rendered || !motion ? 1 : 1 - Math.exp(-elapsed / 100);
            const follow = (key, value) => { pose[key] += (value - pose[key]) * ease; };
            follow('pointerX', pointerX); follow('pointerY', pointerY);
            follow('interaction', motion && pointerActive ? 1 : 0);
            follow('rotation', -.35 + (motion ? (progress - .5) * Math.PI * 1.2 + clock * .22 + pointerX * .15 : 0));
            follow('tilt', motion ? pointerY * .16 : 0);
            material.uniforms.uPointer.value.set(pose.pointerX, pose.pointerY);
            material.uniforms.uInteraction.value = pose.interaction;
            material.uniforms.uRotation.value = pose.rotation;
            material.uniforms.uTilt.value = pose.tilt;
            renderer.render(scene, camera); frames++;
            // Sin tope fijo de FPS; bajo la carga solo si el equipo pierde fluidez xd.
            if (motion && rawElapsed > 0 && rawElapsed < 150) {
                if (!sampleTime) sampleTime = now;
                sampleFrames++; sampleElapsed += rawElapsed;
                if (now - sampleTime >= 1200 && sampleFrames >= 20) {
                    const average = sampleElapsed / sampleFrames; fps = 1000 / average;
                    const oldDensity = density, oldResolution = resolution;
                    if (average > 22) { density = Math.max(.5, density * .82); resolution = Math.max(.72, resolution * .9); }
                    else if (average < 17.8) { density = Math.min(1, density + .08); resolution = Math.min(1, resolution + .04); }
                    if (density !== oldDensity || resolution !== oldResolution) sizeDirty = true;
                    sampleTime = now; sampleFrames = sampleElapsed = 0;
                }
            }
            if (!rendered || now - telemetryAt > 250) {
                canvas.dataset.particleCount = String(geometry.drawRange.count);
                canvas.dataset.rotation = pose.rotation.toFixed(3); canvas.dataset.scatter = pose.interaction.toFixed(3);
                canvas.dataset.quality = quality; canvas.dataset.fps = String(Math.round(fps)); telemetryAt = now;
            }
            rendered = true;
            return motion;
        }
        return {
            render, resize,
            stats: () => ({ frames, points: geometry.drawRange.count, fps, pixelRatio: renderer.getPixelRatio(), drawCalls: renderer.info.render.calls }),
            dispose() { disposed = true; observer?.disconnect(); geometry.dispose(); material.dispose(); renderer.dispose(); }
        };
    }

    window.portfolioAboutRobot = { create, createParticles };
})();
