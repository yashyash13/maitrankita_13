/* ===================================
   ANKITA ART PORTFOLIO — SCRIPT
   Balanced Statue: Elegant Face & Medium Stand
   =================================== */

// ===================================
// GLOBAL STATE
// ===================================
const state = {
    mouse: { x: 0, y: 0, normalizedX: 0, normalizedY: 0 },
    scroll: 0,
    isLoaded: false,
};

// ===================================
// PRELOADER
// ===================================
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.classList.add('hidden');
        state.isLoaded = true;
        animateHeroEntrance();
    }, 2200);
});

// ===================================
// CUSTOM CURSOR
// ===================================
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
    state.mouse.normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouse.normalizedY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animateCursor() {
    followerX += (cursorX - followerX) * 0.12;
    followerY += (cursorY - followerY) * 0.12;
    if (cursor) {
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
    }
    if (cursorFollower) {
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();

// ===================================
// THREE.JS — SCENE SETUP
// ===================================
let scene, camera, renderer, particles;
let statueGroup, headGroup, bodyGroup, leftArmGroup, rightArmGroup;
let dynamicLight, auraRings = [], trailPoints = [];
let trailMesh; // Particles for the brush trail
const clock = new THREE.Clock();

function initThreeJS() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.04);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 7);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    setupLighting();
    createBalancedStatue();
    createParticles();
    createGround();

    updateStatuePosition();
    animate();
}

function setupLighting() {
    scene.add(new THREE.AmbientLight(0x403040, 0.8));

    const keyLight = new THREE.DirectionalLight(0xffe0b0, 1.6);
    keyLight.position.set(4, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb0c0ff, 0.6);
    fillLight.position.set(-5, 2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd0a0, 0.8);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    dynamicLight = new THREE.SpotLight(0xffe0b0, 1.5, 15, Math.PI * 0.15, 0.5, 1);
    dynamicLight.position.set(2, 2, 5);
    dynamicLight.castShadow = true;
    scene.add(dynamicLight);
    scene.add(dynamicLight.target);
}

// Procedural Marble Texture Helper
function createMarbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0ebe3';
    ctx.fillRect(0, 0, 512, 512);

    // Draw subtle marble veins
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        let x = Math.random() * 512, y = Math.random() * 512;
        ctx.moveTo(x, y);
        for (let j = 0; j < 12; j++) {
            x += (Math.random() - 0.5) * 80;
            y += (Math.random() - 0.5) * 80;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
        ctx.globalAlpha = 0.04;
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 15, 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

// ===================================
// CREATE BALANCED STATUE
// ===================================
function createBalancedStatue() {
    statueGroup = new THREE.Group();

    // Materials
    const marbleTex = createMarbleTexture();
    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xffdfc4, map: marbleTex, roughness: 0.15, metalness: 0.05,
        emissive: 0xc9a84c, emissiveIntensity: 0 // For bioluminescent veins
    });
    const dressMat = new THREE.MeshStandardMaterial({
        color: 0x1e5e6e, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide
    });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x110b0b, roughness: 0.6 });
    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffd700, roughness: 0.1, metalness: 0.9, envMapIntensity: 1.5
    });
    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1e, map: marbleTex, roughness: 0.8, metalness: 0.1
    });
    const paintRedMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 }); // Dark brown

    // Store for animation
    statueGroup.userData.materials = { skinMat, dressMat, goldMat, stoneMat };

    // HEAD GROUP
    headGroup = new THREE.Group();

    // Face Shape: Oval / Egg (Classical)
    const headGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.scale.set(0.9, 1.08, 0.95);
    headGroup.add(head);

    // Jawline (Integrated/Smoother)
    // Removed separate jaw sphere for cleaner look

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.35, 24), skinMat);
    neck.position.set(0, -0.48, -0.02);
    headGroup.add(neck);

    // Nose (Sculpted Cone blend)
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.18, 16), skinMat);
    nose.position.set(0, -0.05, 0.32);
    nose.rotation.x = -0.1;
    nose.scale.z = 0.6;
    headGroup.add(nose);

    // Eyes (Classic Almond Shape)
    const eyeBase = new THREE.SphereGeometry(0.06, 24, 24);
    const lEye = new THREE.Mesh(eyeBase, whiteMat);
    lEye.position.set(-0.13, 0.03, 0.27);
    lEye.scale.set(1.0, 0.6, 0.4); // Almond
    lEye.rotation.z = 0.1;
    headGroup.add(lEye);

    const rEye = lEye.clone();
    rEye.position.set(0.13, 0.03, 0.27);
    rEye.rotation.z = -0.1;
    headGroup.add(rEye);

    // Irises
    const irisGeo = new THREE.SphereGeometry(0.028, 16, 16);
    const lIris = new THREE.Mesh(irisGeo, irisMat);
    lIris.position.set(-0.13, 0.03, 0.305);
    lIris.scale.z = 0.2;
    headGroup.add(lIris);

    const rIris = lIris.clone();
    rIris.position.set(0.13, 0.03, 0.305);
    headGroup.add(rIris);

    // Eyeliner (Upper lash line)
    const linerGeo = new THREE.TorusGeometry(0.06, 0.004, 4, 16, 2.0);
    const lLiner = new THREE.Mesh(linerGeo, hairMat);
    lLiner.position.set(-0.13, 0.035, 0.27);
    lLiner.rotation.set(0.6, 0, -1.9);
    headGroup.add(lLiner);

    const rLiner = lLiner.clone();
    rLiner.position.set(0.13, 0.035, 0.27);
    rLiner.rotation.set(0.6, 0, -1.25);
    headGroup.add(rLiner);

    // Smile (Subtle & Elegant)
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 24, 2.2), new THREE.MeshStandardMaterial({ color: 0xc97b7b, roughness: 0.4 }));
    smile.position.set(0, -0.25, 0.31); // Slightly forward
    smile.rotation.set(0.6, 0, -2.6); // Rotate Z to make it a horizontal 'U' shape
    smile.scale.y = 0.8;
    headGroup.add(smile);

    // Cheeks (Texture only, no geometry)
    // Removed big spheres

    // Hair
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), hairMat);
    bun.position.set(0, 0.15, -0.2);
    headGroup.add(bun);

    // Smooth top hair
    const topHair = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.48), hairMat);
    topHair.position.set(0, 0.02, 0);
    headGroup.add(topHair);

    // Gold Earrings
    const earring = new THREE.Mesh(new THREE.SphereGeometry(0.035), goldMat);
    const lEar = earring.clone(); lEar.position.set(-0.35, -0.15, 0); headGroup.add(lEar);
    const rEar = earring.clone(); rEar.position.set(0.35, -0.15, 0); headGroup.add(rEar);

    headGroup.position.set(0, 1.45, 0);
    statueGroup.add(headGroup);

    // Halo / Aura Rings
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffd700, transparent: true, opacity: 0.4, emissive: 0xc9a84c, emissiveIntensity: 0.5 });
    for (let i = 0; i < 2; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55 + i * 0.1, 0.005, 8, 50), ringMat);
        ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5);
        ring.rotation.y = (Math.random() - 0.5);
        headGroup.add(ring);
        auraRings.push(ring);
    }


    // BODY
    bodyGroup = new THREE.Group();
    const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.42, 0.35, 24, 1, false, 0, Math.PI * 2), skinMat);
    shoulders.position.y = 1.05; shoulders.scale.set(1.3, 1, 0.75);
    bodyGroup.add(shoulders);

    // Dress (Lathe)
    const dPts = [];
    for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const y = (t - 0.5) * 2.1;
        let w = 0.2 + (1 - t) * 0.4; // A-line
        if (t > 0.8) w = 0.36;
        if (t > 0.9) w = 0.16;
        dPts.push(new THREE.Vector2(w, y));
    }
    const dress = new THREE.Mesh(new THREE.LatheGeometry(dPts, 32), dressMat);
    dress.position.y = 0.1;
    dress.castShadow = true;
    bodyGroup.add(dress);
    bodyGroup.userData.originalDressScale = new THREE.Vector3(1, 1, 1);

    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 8, 32), goldMat);
    belt.rotateX(Math.PI / 2); belt.position.y = 0.32;
    bodyGroup.add(belt);
    statueGroup.add(bodyGroup);

    // ARMS
    function createArm(pts) {
        const p = new THREE.CatmullRomCurve3(pts);
        return new THREE.Mesh(new THREE.TubeGeometry(p, 12, 0.07, 8, false), skinMat);
    }
    rightArmGroup = new THREE.Group();
    const rArm = createArm([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.22, -0.35, 0.15), new THREE.Vector3(0.08, -0.55, 0.35)]);
    rightArmGroup.add(rArm);
    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.07), skinMat);
    rHand.position.set(0.08, -0.55, 0.35); rightArmGroup.add(rHand);

    // Brush
    const brush = new THREE.Group();
    brush.add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.5, 8), goldMat));
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.1, 8), paintRedMat);
    tip.position.y = 0.3; brush.add(tip);
    brush.position.set(0.08, -0.5, 0.35); brush.rotation.set(0.3, 0, -0.4);
    rightArmGroup.add(brush);
    rightArmGroup.position.set(0.28, 1.0, 0); // Shoulder attach
    statueGroup.add(rightArmGroup);

    leftArmGroup = new THREE.Group();
    const lArm = createArm([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.22, -0.35, 0.1), new THREE.Vector3(-0.15, -0.55, 0.3)]);
    leftArmGroup.add(lArm);
    const pal = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.015, 16), new THREE.MeshStandardMaterial({ color: 0x8d6e63 }));
    pal.position.set(-0.15, -0.58, 0.35); pal.rotation.set(0.4, 0, 0.25);
    leftArmGroup.add(pal);
    [0xff0000, 0xffd700, 0x00ff00, 0x0000ff].forEach((c, i) => {
        const d = new THREE.Mesh(new THREE.SphereGeometry(0.038), new THREE.MeshStandardMaterial({ color: c }));
        d.position.set(Math.cos(i) * 0.13, 0.02, Math.sin(i) * 0.13);
        pal.add(d);
    });
    leftArmGroup.position.set(-0.28, 1.0, 0);
    statueGroup.add(leftArmGroup);

    // SPARKLING GLITTER
    const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(240);
    for (let i = 0; i < 80; i++) {
        const r = 0.55 + Math.random() * 0.7;
        const th = Math.random() * Math.PI * 2;
        sPos[i * 3] = r * Math.cos(th); sPos[i * 3 + 1] = Math.random() * 2.2 - 1.0; sPos[i * 3 + 2] = r * Math.sin(th);
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    const sMat = new THREE.PointsMaterial({ color: 0xffd700, size: 0.045, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
    const sparkles = new THREE.Points(sGeo, sMat);
    statueGroup.add(sparkles);
    statueGroup.userData.sparkles = sparkles;

    // ==========================================
    // STAND (Reduced Height)
    // ==========================================
    const pGroup = new THREE.Group();
    // stoneMat is already defined in the materials section above

    // Top
    const pTop = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.65, 0.15, 32), stoneMat);
    pTop.position.y = -0.925;
    pTop.receiveShadow = true;
    pGroup.add(pTop);

    // Column (Shorter now: 0.8 height instead of 1.2)
    const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.8, 24), stoneMat);
    pCol.position.y = -1.4; // Center
    pCol.castShadow = true;
    pGroup.add(pCol);

    // Base
    const pBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.3, 32), stoneMat);
    pBase.position.y = -1.95;
    pBase.receiveShadow = true;
    pGroup.add(pBase);

    // Gold Rings
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.67, 0.025, 8, 48), goldMat);
    r1.position.y = -0.925; r1.rotation.x = Math.PI / 2;
    pGroup.add(r1);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.02, 8, 48), goldMat);
    r2.position.y = -1.8; r2.rotation.x = Math.PI / 2;
    pGroup.add(r2);

    statueGroup.add(pGroup);

    // TRAIL INITIALIZATION
    const trailGeo = new THREE.BufferGeometry();
    const trailPos = new Float32Array(300); // 100 points
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    const trailMat = new THREE.PointsMaterial({ color: 0xffd700, size: 0.04, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    trailMesh = new THREE.Points(trailGeo, trailMat);
    scene.add(trailMesh);

    scene.add(statueGroup);
}

function createParticles() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(600);
    for (let i = 0; i < 600; i++) pos[i] = (Math.random() - 0.5) * 14;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.015, transparent: true, opacity: 0.2 });
    particles = new THREE.Points(geo, mat);
    scene.add(particles);
}

function createGround() {
    // Raise ground back up slightly as stand is shorter
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x08080c, roughness: 0.9 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -2.1; ground.receiveShadow = true;
    scene.add(ground);
}

function updateStatuePosition() {
    if (!statueGroup) return;
    const aspect = window.innerWidth / window.innerHeight;

    // Scale adjustment: smaller on mobile to avoid covering text
    let s = aspect < 1 ? 0.45 : (aspect < 1.4 ? 0.8 : 1.0);
    statueGroup.scale.set(s, s, s);

    if (aspect > 1) {
        const vH = 2 * 7 * Math.tan((40 * Math.PI) / 360);
        // Position: right side for desktop
        statueGroup.position.set((vH * aspect) * 0.32, -0.6, 0);
        statueGroup.rotation.y = -0.6;
    } else {
        // Pushed lower and further back for mobile to stay out of the way of centered text
        statueGroup.position.set(0, -1.8, -1);
        statueGroup.rotation.y = -0.2;
    }
}

function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    const mx = state.mouse.normalizedX; const my = state.mouse.normalizedY;

    if (statueGroup) {
        statueGroup.position.y += Math.sin(elapsed * 0.7) * 0.0008;
        const tRotY = (window.innerWidth / window.innerHeight > 1 ? -0.6 : -0.3) + mx * 0.1;
        statueGroup.rotation.y += (tRotY - statueGroup.rotation.y) * 0.05;
        statueGroup.rotation.x += (-my * 0.05 - statueGroup.rotation.x) * 0.05;

        if (headGroup) { headGroup.rotation.y = mx * 0.2; headGroup.rotation.x = -my * 0.15; }
        if (statueGroup.userData.sparkles) {
            const s = statueGroup.userData.sparkles;
            s.rotation.y -= 0.005; s.material.opacity = 0.6 + Math.sin(elapsed * 2) * 0.2;
        }

        // Bioluminescent Veins Pulse
        if (statueGroup.userData.materials && statueGroup.userData.materials.skinMat) {
            const mat = statueGroup.userData.materials.skinMat;
            // Only pulse if not currently in "Gold Mode" (or pulse subtler)
            mat.emissiveIntensity = 0.15 + Math.sin(elapsed * 1.5) * 0.15;
        }

        // Aura Animation
        auraRings.forEach((r, i) => {
            r.rotation.z += 0.01 * (i + 1);
            r.rotation.x += 0.005 * (i % 2 ? -1 : 1);
        });

        // Dress Waving
        if (bodyGroup.children[1]) {
            const dress = bodyGroup.children[1];
            dress.rotation.z = Math.sin(elapsed * 0.5) * 0.02;
            dress.scale.x = 1 + Math.sin(elapsed * 0.8) * 0.01;
        }

        // Trail Logic (Brush Tip)
        if (rightArmGroup && trailMesh) {
            const brushTip = new THREE.Vector3();
            // The brush tip is at brush's tip child local (0, 0.3, 0)
            const brush = rightArmGroup.children[2];
            if (brush && brush.children[1]) {
                brush.children[1].getWorldPosition(brushTip);
                trailPoints.unshift(brushTip.clone());
                if (trailPoints.length > 100) trailPoints.pop();

                const posAttr = trailMesh.geometry.attributes.position;
                for (let i = 0; i < 100; i++) {
                    if (trailPoints[i]) {
                        posAttr.setXYZ(i, trailPoints[i].x, trailPoints[i].y, trailPoints[i].z);
                    }
                }
                posAttr.needsUpdate = true;
                trailMesh.material.opacity = 0.4 + Math.sin(elapsed * 5) * 0.2;
            }
        }
    }
    if (particles) particles.rotation.y = elapsed * 0.01;
    if (dynamicLight) {
        // Smoothly interpolate spotlight to mouse position
        const tx = mx * 6;
        const ty = my * 4;
        dynamicLight.position.x += (tx - dynamicLight.position.x) * 0.1;
        dynamicLight.position.y += (ty - dynamicLight.position.y) * 0.1;
        if (statueGroup) {
            dynamicLight.target.position.lerp(new THREE.Vector3(statueGroup.position.x, statueGroup.position.y + 0.5, statueGroup.position.z), 0.1);
        }
    }
    renderer.render(scene, camera);
}

function animateHeroEntrance() {
    gsap.to('.title-word', { y: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.2 });
    gsap.to('.hero-tag', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });
    gsap.to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 });
    gsap.to('.hero-actions', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.7 });

    // Liquid Gold Hover Listener
    const exploreBtn = document.getElementById('exploreBtn');
    if (exploreBtn && statueGroup && statueGroup.userData.materials) {
        const mat = statueGroup.userData.materials.skinMat;
        exploreBtn.addEventListener('mouseenter', () => {
            gsap.to(mat, { metalness: 1, roughness: 0.1, duration: 1.5, ease: 'power2.inOut' });
            gsap.to(mat.color, { r: 1, g: 0.84, b: 0, duration: 1.5 }); // Gold color
        });
        exploreBtn.addEventListener('mouseleave', () => {
            gsap.to(mat, { metalness: 0.05, roughness: 0.15, duration: 1.5, ease: 'power2.inOut' });
            gsap.to(mat.color, { r: 1, g: 0.87, b: 0.77, duration: 1.5 }); // Back to skin tone (0xffdfc4)
        });
    }

    if (statueGroup) {
        gsap.from(statueGroup.position, { x: 8, duration: 1.8, ease: 'power3.out', delay: 0.1 });
        gsap.from(statueGroup.rotation, { y: 0, duration: 1.8, ease: 'power3.out', delay: 0.1 });
    }
}

const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    updateStatuePosition();
});
window.addEventListener('scroll', () => { state.scroll = window.scrollY; navbar.classList.toggle('scrolled', window.scrollY > 50); });
// Setup Nav Links indices for staggered animation
document.querySelectorAll('.nav-link').forEach((link, index) => {
    link.style.setProperty('--item-index', index + 1);
});

navToggle?.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
});

// Close menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle?.classList.remove('active');
        navLinks?.classList.remove('active');
        document.body.style.overflow = '';
    });
});
const filterBtns = document.querySelectorAll('.filter-btn');
const artCards = document.querySelectorAll('.art-card');
filterBtns.forEach(b => {
    b.addEventListener('click', () => {
        filterBtns.forEach(bt => bt.classList.remove('active'));
        b.classList.add('active');
        artCards.forEach((c, i) => {
            if (b.dataset.filter === 'all' || c.dataset.category === b.dataset.filter) {
                c.style.display = 'block'; gsap.fromTo(c, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, delay: i * 0.05 });
            } else c.style.display = 'none';
        });
    });
});
const artModal = document.getElementById('artModal');
const artModalBackdrop = document.getElementById('artModalBackdrop');
const artModalClose = document.getElementById('artModalClose');
function closeModal() { artModal.classList.remove('active'); document.body.style.overflow = ''; }
document.querySelectorAll('.art-quick-view, .art-buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (btn.tagName === 'A') return;
        e.preventDefault();
        artModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const card = btn.closest('.art-card');
        document.getElementById('artModalImg').src = card.querySelector('img').src;
        document.getElementById('artModalTitle').textContent = card.querySelector('h3').innerText;
    });
});
artModalBackdrop?.addEventListener('click', closeModal);
artModalClose?.addEventListener('click', closeModal);
initThreeJS();

// ===================================
// ART CARD PARALLAX & REVEALS
// ===================================
function setupArtInteractions() {
    // Staggered reveals for sections using ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const revealSelectors = [
        { trigger: '#gallery', elements: '.section-header, .gallery-filters, .art-card' },
        { trigger: '#about', elements: '.section-tag, .about-title, .about-text, .about-actions, .about-image-wrapper' },
        { trigger: '#contact', elements: '.section-tag, .contact-title, .contact-text, .contact-link, .contact-form' }
    ];

    revealSelectors.forEach(group => {
        gsap.from(group.elements, {
            scrollTrigger: {
                trigger: group.trigger,
                start: 'top 80%',
            },
            y: 50,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out',
            clearProps: 'all'
        });
    });
}
setupArtInteractions();

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
    });
});

// ===================================
// STATS ANIMATION
// ===================================
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                let current = 0;
                const duration = 2000; // 2 seconds
                const frameRate = 60;
                const totalFrames = (duration / 1000) * frameRate;
                const increment = target / totalFrames;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    // Add '+' for large numbers like followers
                    const suffix = target >= 1000 ? '+' : '';
                    entry.target.innerText = Math.floor(current).toLocaleString() + suffix;
                }, 1000 / frameRate);

                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(s => obs.observe(s));
}

document.addEventListener('DOMContentLoaded', animateStats);
animateStats(); // Call immediately in case DOM is already ready

