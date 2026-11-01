(function () {
  if (!window.THREE) return;

  const canvas = document.getElementById('world-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 500);
  camera.position.set(0, 5, 13);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (error) { canvas.remove(); document.body.classList.add('webgl-fallback'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;

  const world = new THREE.Group();
  scene.add(world);
  const lights = new THREE.Group();
  scene.add(lights);
  const ambient = new THREE.HemisphereLight(0xbcdcff, 0x101923, 1.8);
  const sun = new THREE.DirectionalLight(0xffe5bb, 3.2);
  sun.position.set(-8, 14, 8);
  sun.castShadow = true;
  lights.add(ambient, sun);

  const palette = {
    space: { sky: 0x02040b, ground: 0x11152a, accent: 0x9fa4ff, fog: 0x02040b },
    sea: { sky: 0x071b2b, ground: 0x1d7583, accent: 0xf3c67b, fog: 0x071b2b },
    sky: { sky: 0x416da4, ground: 0xb7d1e8, accent: 0xffffff, fog: 0x6e9bd0 },
    war: { sky: 0x241f2a, ground: 0x433a35, accent: 0xc87556, fog: 0x241f2a }
  };
  let mode = 'space';
  let chapterTransitionTimer = null;
  let time = 0;
  let waveMesh = null;
  let starField = null;
  const solarBodies = [];
  const galaxySystems = [];

  const mat = (color, roughness = 0.7, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const clear = group => { while (group.children.length) group.remove(group.children[0]); };
  const box = (w, h, d, material, x, y, z) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; return mesh; };
  const skyTexture = (top, middle, bottom) => { const canvas2d = document.createElement('canvas'); canvas2d.width = 4; canvas2d.height = 256; const context = canvas2d.getContext('2d'); const gradient = context.createLinearGradient(0, 0, 0, 256); gradient.addColorStop(0, top); gradient.addColorStop(.55, middle); gradient.addColorStop(1, bottom); context.fillStyle = gradient; context.fillRect(0, 0, 4, 256); const texture = new THREE.CanvasTexture(canvas2d); texture.colorSpace = THREE.SRGBColorSpace; return texture; };
  const starTexture = (() => { const canvas2d = document.createElement('canvas'); canvas2d.width = 64; canvas2d.height = 64; const context = canvas2d.getContext('2d'); const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32); gradient.addColorStop(0, 'rgba(255,255,255,1)'); gradient.addColorStop(.12, 'rgba(255,255,255,1)'); gradient.addColorStop(.3, 'rgba(235,244,255,.96)'); gradient.addColorStop(.62, 'rgba(140,190,255,.55)'); gradient.addColorStop(1, 'rgba(75,110,255,0)'); context.fillStyle = gradient; context.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(canvas2d); })();

  function addCloud(x, y, z, scale = 1) {
    const cloud = new THREE.Group();
    const material = mat(0xffffff, 1, 0);
    [[0, 0, 0], [1.2, .15, .1], [-1.1, .1, .15], [.25, .45, 0]].forEach(([a, b, c], i) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(i === 3 ? .8 : 1, 16, 10), material);
      puff.position.set(a, b, c); cloud.add(puff);
    });
    cloud.position.set(x, y, z); cloud.scale.setScalar(scale); world.add(cloud);
  }

  function addPlane(x, y, z, color, rotation = 0) {
    const plane = new THREE.Group();
    const body = box(3, .22, .42, mat(color, .35, .25), 0, 0, 0);
    const wing = box(.25, .08, 3.2, mat(color, .35, .25), 0, 0, 0);
    const tail = box(.18, .5, .5, mat(color, .35, .25), -1.05, .2, 0);
    plane.add(body, wing, tail); plane.position.set(x, y, z); plane.rotation.y = rotation; plane.rotation.z = -.12; plane.castShadow = true; world.add(plane);
  }

  function addPalm(x, z, scale = 1) {
    const palm = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.12, .24, 3.2, 8), mat(0x8b6542)); trunk.position.y = 1.6; palm.add(trunk);
    for (let i = 0; i < 7; i++) { const leaf = new THREE.Mesh(new THREE.BoxGeometry(.12, .06, 1.9), mat(0x2f8a63)); leaf.position.set(Math.cos(i) * .75, 3.2, Math.sin(i) * .75); leaf.rotation.y = i; leaf.rotation.z = -.25; palm.add(leaf); }
    palm.position.set(x, 0, z); palm.scale.setScalar(scale); world.add(palm);
  }

  function addBoat(x, y, z, scale = 1) {
    const boat = new THREE.Group(); boat.add(box(2.4, .3, .8, mat(0xeee1c2), 0, 0, 0)); boat.add(box(.12, 1.8, .12, mat(0x705542), 0, .9, 0)); const sail = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 1.7, 0), new THREE.Vector3(0, .2, 0), new THREE.Vector3(1.1, .5, 0)]), new THREE.LineBasicMaterial({ color: 0xfff2d5 })); boat.add(sail); boat.position.set(x, y, z); boat.scale.setScalar(scale); world.add(boat); return boat;
  }

  function addMountain(x, z, scale = 1, color = 0x56697b) { const mountain = new THREE.Mesh(new THREE.ConeGeometry(4, 6, 5), mat(color)); mountain.position.set(x, 2.5, z); mountain.scale.setScalar(scale); world.add(mountain); }
  function addDune(x, z, scale = 1) { const dune = new THREE.Mesh(new THREE.SphereGeometry(4, 18, 10), mat(0xb7794e)); dune.scale.set(1.5 * scale, .42 * scale, .8 * scale); dune.position.set(x, .35 * scale, z); world.add(dune); }

  function addPlanet(x, y, z, size, color, ring = false) {
    const planet = new THREE.Group(); const sphere = new THREE.Mesh(new THREE.SphereGeometry(size, 32, 24), mat(color, .8, .05)); sphere.castShadow = true; planet.add(sphere);
    if (ring) { const orbit = new THREE.Mesh(new THREE.TorusGeometry(size * 1.55, size * .08, 8, 64), new THREE.MeshBasicMaterial({ color: 0xa7a7e8, transparent: true, opacity: .7 })); orbit.rotation.x = .8; planet.add(orbit); }
    planet.position.set(x, y, z); world.add(planet); return planet;
  }

  function addSolarPlanet(system, radius, size, color, speed, ring = false, moon = false) {
    const orbit = new THREE.Group(); orbit.rotation.y = Math.random() * Math.PI * 2; system.add(orbit);
    const path = new THREE.Mesh(new THREE.TorusGeometry(radius, .012, 6, 160), new THREE.MeshBasicMaterial({ color: 0x777aa8, transparent: true, opacity: .24 })); path.rotation.x = Math.PI / 2; system.add(path);
    const planet = new THREE.Mesh(new THREE.SphereGeometry(size, 24, 16), mat(color, .8, .1)); planet.position.x = radius; planet.castShadow = true; orbit.add(planet);
    if (ring) { const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(size * 1.7, size * .08, 8, 64), new THREE.MeshBasicMaterial({ color: 0xc3b8e8, transparent: true, opacity: .7 })); ringMesh.rotation.x = Math.PI / 2.5; planet.add(ringMesh); }
    if (moon) { const moonOrbit = new THREE.Group(); planet.add(moonOrbit); const moonPath = new THREE.Mesh(new THREE.TorusGeometry(size * 2.2, .006, 6, 64), new THREE.MeshBasicMaterial({ color: 0x7f83a9, transparent: true, opacity: .35 })); moonPath.rotation.x = Math.PI / 2; moonOrbit.add(moonPath); const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(size * .3, 14, 10), mat(0xbcc1d7)); moonMesh.position.x = size * 2.2; moonOrbit.add(moonMesh); }
    solarBodies.push({ orbit, speed, planet });
  }

  function addGalaxy(x, y, z, scale, color, tilt = 0) {
    const galaxy = new THREE.Group(); const positions = []; const colors = []; const coreColor = new THREE.Color(color);
    for (let i = 0; i < 1800; i++) { const arm = i % 3; const radius = Math.pow(Math.random(), .58) * 8.5; const angle = radius * 1.35 + arm * (Math.PI * 2 / 3) + (Math.random() - .5) * .65; const spread = (Math.random() - .5) * (.22 + radius * .08); positions.push(Math.cos(angle) * radius, spread, Math.sin(angle) * radius); const tint = coreColor.clone().offsetHSL((Math.random() - .5) * .08, 0, (Math.random() - .5) * .25); colors.push(tint.r, tint.g, tint.b); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ map: starTexture, size: .2, vertexColors: true, transparent: true, alphaTest: .01, depthWrite: false, opacity: 1, blending: THREE.AdditiveBlending })); galaxy.add(stars);
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.15, 24, 16), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .5, blending: THREE.AdditiveBlending })); galaxy.add(core);
    galaxy.position.set(x, y, z); galaxy.scale.setScalar(scale); galaxy.rotation.x = tilt; world.add(galaxy); galaxySystems.push({ galaxy, speed: .0005 + Math.random() * .0008 });
  }

  function buildSpace() {
    solarBodies.length = 0; galaxySystems.length = 0;
    const stars = new THREE.BufferGeometry(); const points = [];
    for (let i = 0; i < 4200; i++) { const radius = 18 + Math.random() * 90; const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1); points.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)); }
    stars.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); starField = new THREE.Points(stars, new THREE.PointsMaterial({ map: starTexture, color: 0xffffff, size: .36, sizeAttenuation: true, transparent: true, alphaTest: .01, depthWrite: false, opacity: 1, blending: THREE.AdditiveBlending })); world.add(starField);
    addGalaxy(-14, 8, -38, 2.25, 0x8275e8, .45); addGalaxy(17, -4, -46, 1.8, 0x5cc5da, 1.05); addGalaxy(-18, -8, -55, 1.45, 0xe58a9a, .8); addGalaxy(14, 9, -65, 1.15, 0xd9b66d, .2);
    const system = new THREE.Group(); system.position.set(0, 1, -11); system.scale.setScalar(1.35); world.add(system);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1.65, 32, 24), new THREE.MeshBasicMaterial({ color: 0xffc36f })); system.add(sun); const sunGlow = new THREE.PointLight(0xffb86b, 5, 35); sunGlow.position.set(0, 0, 0); system.add(sunGlow);
    addSolarPlanet(system, 3.2, .25, 0xa6a7b8, .022);
    addSolarPlanet(system, 4.4, .4, 0xd5a66c, .016);
    addSolarPlanet(system, 5.7, .48, 0x4e82bb, .011, false, true);
    addSolarPlanet(system, 7.1, .34, 0xd46e5e, .008);
    addSolarPlanet(system, 8.5, .85, 0xd8bd8d, .005, true);
    addSolarPlanet(system, 10.4, .65, 0x7589c0, .003, true);
    const station = new THREE.Group(); station.add(box(3.8, .18, .18, mat(0xc9d1e8, .4, .6), 0, 0, 0)); station.add(box(.18, 3.8, .18, mat(0xc9d1e8, .4, .6), 0, 0, 0)); station.add(new THREE.Mesh(new THREE.SphereGeometry(.35, 16, 12), mat(0x8d9cff, .3, .4))); station.position.set(5, 4, -12); station.rotation.z = .45; world.add(station);
    const nebula = new THREE.Mesh(new THREE.SphereGeometry(22, 24, 16), new THREE.MeshBasicMaterial({ color: 0x35266e, transparent: true, opacity: .1, side: THREE.BackSide })); nebula.position.set(0, 4, -28); world.add(nebula);
  }

  function addStarField(count = 2200, size = .1) {
    const stars = new THREE.BufferGeometry(); const points = [];
    for (let i = 0; i < count; i++) { const radius = 16 + Math.random() * 90; const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1); points.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)); }
    stars.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); starField = new THREE.Points(stars, new THREE.PointsMaterial({ map: starTexture, color: 0xffffff, size: size * 3.1, sizeAttenuation: true, transparent: true, alphaTest: .01, depthWrite: false, opacity: 1, blending: THREE.AdditiveBlending })); world.add(starField);
  }

  function addBlackHole(x, y, z, scale = 1) {
    const hole = new THREE.Group(); const disk = new THREE.Mesh(new THREE.TorusGeometry(2.2, .42, 16, 80), new THREE.MeshBasicMaterial({ color: 0xff8b62, transparent: true, opacity: .75, blending: THREE.AdditiveBlending })); disk.rotation.x = .35; hole.add(disk); const core = new THREE.Mesh(new THREE.SphereGeometry(1.55, 24, 16), new THREE.MeshBasicMaterial({ color: 0x010106 })); hole.add(core); const halo = new THREE.Mesh(new THREE.TorusGeometry(2.7, .08, 8, 80), new THREE.MeshBasicMaterial({ color: 0xa393ff, transparent: true, opacity: .55 })); halo.rotation.x = .35; hole.add(halo); hole.position.set(x, y, z); hole.scale.setScalar(scale); world.add(hole); galaxySystems.push({ galaxy: hole, speed: .0007 });
  }

  function addSpacecraft(x, y, z, scale = 1, color = 0xbfc9e8) { const craft = new THREE.Group(); craft.add(box(2.2, .5, .65, mat(color, .35, .55), 0, 0, 0)); craft.add(box(.18, 2.8, .05, mat(0x5d80d5, .35, .3), 0, 0, 0)); craft.add(box(3.4, .12, .05, mat(0x5d80d5, .35, .3), 0, 0, 0)); craft.add(new THREE.Mesh(new THREE.SphereGeometry(.38, 16, 12), mat(0x8ef0ee, .25, .5))); craft.position.set(x, y, z); craft.scale.setScalar(scale); craft.rotation.z = -.18; world.add(craft); galaxySystems.push({ galaxy: craft, speed: .0011 }); }
  function addSatellite(x, y, z, scale = 1) { const satellite = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(.9, .8, .9), new THREE.MeshStandardMaterial({ color: 0xf0e4c6, roughness: .25, metalness: .55, emissive: 0x3a3154, emissiveIntensity: .35 })); body.castShadow = true; satellite.add(body); const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x4e8dff, roughness: .2, metalness: .35, emissive: 0x1f4fc4, emissiveIntensity: .55 }); satellite.add(box(.1, 1.65, 2.8, panelMaterial, -2.05, 0, 0)); satellite.add(box(.1, 1.65, 2.8, panelMaterial, 2.05, 0, 0)); satellite.add(box(4.2, .08, .08, mat(0xf4c46f, .3, .65), 0, 0, 0)); const antenna = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, 1.2, 16), mat(0xf8c878, .25, .6)); antenna.rotation.z = Math.PI / 2; antenna.position.y = .75; satellite.add(antenna); const beacon = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff6d8f, blending: THREE.AdditiveBlending })); beacon.position.set(0, .65, 0); satellite.add(beacon); satellite.position.set(x, y, z); satellite.scale.setScalar(scale); world.add(satellite); galaxySystems.push({ galaxy: satellite, speed: .0008 }); }

  function buildGalaxyChapter() { addStarField(4200, .16); addGalaxy(-12, 5, -28, 2.9, 0x8c78ee, .5); addGalaxy(12, -2, -38, 2.5, 0x55cfe2, 1); addGalaxy(-2, 9, -52, 2.1, 0xe98ba3, .25); addGalaxy(18, 8, -62, 1.65, 0xd8bb70, .7); }
  function buildSpacecraftChapter() { addStarField(5000, .2); addSpacecraft(-8, 4, -24, 1.15); addSpacecraft(7, -1, -32, .8, 0xd8c0a2); addSatellite(-1, 4, -22, 2.4); addSatellite(9, -2, -30, 1.9); addGalaxy(15, 8, -60, 1.8, 0x6d72c6, .8); }
  function buildNebulaChapter() { addStarField(3600, .16); for (let i = 0; i < 7; i++) { const cloud = new THREE.Mesh(new THREE.SphereGeometry(5 + i, 18, 12), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x5b3eaa : 0x267c9b, transparent: true, opacity: .045, side: THREE.BackSide })); cloud.position.set((i - 3) * 5, (i % 3) * 3 - 3, -28 - i * 5); world.add(cloud); } addGalaxy(-8, 5, -42, 1.6, 0x9b80d9, .4); }

  function setChapter(next) {
    if (!next || next === mode) return;
    mode = next;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    canvas.classList.add('is-changing');
    clearTimeout(chapterTransitionTimer);
    chapterTransitionTimer = setTimeout(() => {
      waveMesh = null; starField = null; solarBodies.length = 0; galaxySystems.length = 0; clear(world);
      if (next === 'solar') buildSpace(); if (next === 'galaxies') buildGalaxyChapter(); if (next === 'spacecraft') buildSpacecraftChapter(); if (next === 'nebula') buildNebulaChapter();
      const labels = { solar: ['SOLAR SYSTEM', 'SPACE / 01'], galaxies: ['INTERTWINED GALAXIES', 'SPACE / 02'], spacecraft: ['SPACECRAFT & SATELLITES', 'SPACE / 03'], nebula: ['DEEP NEBULA', 'SPACE / 04'] }[next]; const label = document.getElementById('space-context-name'); const code = document.getElementById('space-context-code'); if (label) label.textContent = labels[0]; if (code) code.textContent = labels[1];
      if (window.gsap && !reducedMotion) window.gsap.fromTo(world.scale, { x: .78, y: .78, z: .78 }, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'power3.out' });
      canvas.classList.remove('is-changing');
    }, reducedMotion ? 0 : 260);
  }

  function addSmoke(x, y, z) { const smoke = new THREE.Group(); for (let i = 0; i < 5; i++) { const puff = new THREE.Mesh(new THREE.SphereGeometry(.45 + i * .12, 10, 8), mat(0x6d625d, 1)); puff.position.set((Math.random() - .5) * .5, i * .55, (Math.random() - .5) * .5); smoke.add(puff); } smoke.position.set(x, y, z); world.add(smoke); }

  function addTank(x, z, rotation = 0) {
    const tank = new THREE.Group();
    const olive = mat(0x657053, .9, 0); const dark = mat(0x263029, .9, 0);
    tank.add(box(2.3, .55, 1.35, olive, 0, .35, 0));
    tank.add(box(1.1, .35, .9, dark, .1, .78, 0));
    tank.add(box(2.1, .12, .15, dark, 1.1, .91, 0));
    [-.75, .75].forEach(x => { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, 1.5, 12), dark); wheel.rotation.z = Math.PI / 2; wheel.position.set(x, .2, 0); tank.add(wheel); });
    tank.position.set(x, 0, z); tank.rotation.y = rotation; world.add(tank);
  }

  function buildSea() {
    const water = new THREE.Mesh(new THREE.PlaneGeometry(90, 90, 48, 48), mat(0x167c8d, .22, .12)); water.rotation.x = -Math.PI / 2; water.position.y = -.1; waveMesh = water; world.add(water);
    const sand = box(80, .15, 8, mat(0xd9b777), 0, -.08, -10); world.add(sand);
    for (let i = 0; i < 18; i++) { const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.25 + Math.random() * .5), mat(0x776e67)); rock.position.set((Math.random() - .5) * 22, .2, -7 + Math.random() * 7); world.add(rock); }
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 16), mat(0xffc978, .4)); sunMesh.position.set(-10, 9, -21); world.add(sunMesh);
    addPalm(-7, -7, 1.4); addPalm(-4, -8, 1); addPalm(7, -9, 1.2); addBoat(-5, .2, -18, 1.3); addBoat(7, .1, -24, .9); addCloud(5, 7, -13, 1.1); addCloud(-4, 6, -15, .7);
  }

  function buildSky() {
    const cloudFloor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), mat(0xd6e8f3, 1)); cloudFloor.position.y = -2; world.add(cloudFloor);
    for (let i = 0; i < 7; i++) addCloud((Math.random() - .5) * 18, 1 + Math.random() * 6, -7 - Math.random() * 10, .6 + Math.random() * .8);
    addMountain(-10, -15, 1.7); addMountain(0, -19, 2.1, 0x667c91); addMountain(11, -17, 1.5); for (let i = 0; i < 8; i++) addPlane(-12 + i * 3.5, 4 + (i % 3) * 1.5, -6 - (i % 4) * 5, i % 2 ? 0xd5e1ec : 0xf2f4f1, (i % 2 ? .3 : -.2));
  }

  function buildWar() {
    const battlefield = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), mat(0x4b4037, 1)); battlefield.rotation.x = -Math.PI / 2; world.add(battlefield);
    for (let i = 0; i < 14; i++) { const block = box(.5 + Math.random() * 1.8, .4 + Math.random() * 1.5, .5 + Math.random() * 1.8, mat(0x62534a), (Math.random() - .5) * 18, .3, -10 + Math.random() * 12); world.add(block); }
    addDune(-10, -10, 2.1); addDune(10, -15, 2.5); addMountain(-10, -16, 1.8, 0x3d3432); addMountain(8, -19, 2.1, 0x4c3d38); addTank(-4, -3, -.2); addTank(4, -7, .3); addTank(-1, -14, .1); addPlane(1, 6, -12, 0x8f655b, -.1); addPlane(-7, 8, -19, 0x76625a, .25); addSmoke(-4, .3, -8); addSmoke(6, .3, -13);
  }

  function setMode(next) {
    mode = 'space'; waveMesh = null; starField = null; clear(world); const colors = palette.space; scene.background = skyTexture('#01030b', '#090d27', '#1e1a42'); scene.fog = new THREE.Fog(colors.fog, 20, 100); ambient.color.set(colors.accent); sun.color.set(0x9b8cff); buildSpace();
    window.applyAppWorld?.(next);
    if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) window.gsap.fromTo(world.scale, { x: .82, y: .82, z: .82 }, { x: 1, y: 1, z: 1, duration: 1.25, ease: 'power3.out' });
  }

  setMode('space');

  // Change the space view by viewport screen, rather than by content section.
  // This keeps the background moving naturally as each screenful enters view.
  const chapterSequence = ['solar', 'galaxies', 'nebula', 'spacecraft'];
  let screenChapter = 0;
  let screenChangeQueued = false;
  const updateScreenChapter = () => {
    screenChangeQueued = false;
    const nextChapter = Math.floor((scrollY + innerHeight * .5) / innerHeight) % chapterSequence.length;
    if (nextChapter === screenChapter) return;
    screenChapter = nextChapter;
    setChapter(chapterSequence[screenChapter]);
  };
  addEventListener('scroll', () => {
    if (screenChangeQueued) return;
    screenChangeQueued = true;
    requestAnimationFrame(updateScreenChapter);
  }, { passive: true });
  addEventListener('resize', updateScreenChapter);

  let pointerX = 0; let pointerY = 0;
  let yaw = 0; let pitch = -0.18; let distance = 13; let dragging = false; let lastX = 0; let lastY = 0;
  addEventListener('pointerdown', event => {
    if (event.target.closest?.('a,button,input,textarea,select')) return;
    dragging = true; lastX = event.clientX; lastY = event.clientY;
  });
  addEventListener('pointerup', () => { dragging = false; });
  addEventListener('pointercancel', () => { dragging = false; });
  addEventListener('pointermove', event => {
    if (!dragging) return;
    yaw += (event.clientX - lastX) * .006;
    pitch = Math.max(-.7, Math.min(.35, pitch + (event.clientY - lastY) * .004));
    lastX = event.clientX; lastY = event.clientY;
  });
  canvas.addEventListener('wheel', event => { event.preventDefault(); distance = Math.max(9, Math.min(24, distance + event.deltaY * .012)); }, { passive: false });
  let touchDistance = 0;
  canvas.addEventListener('touchstart', event => { if (event.touches.length === 2) touchDistance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY); }, { passive: true });
  canvas.addEventListener('touchmove', event => { if (event.touches.length !== 2) return; const next = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY); distance = Math.max(9, Math.min(24, distance - (next - touchDistance) * .02)); touchDistance = next; }, { passive: true });
  addEventListener('pointermove', event => { pointerX = (event.clientX / innerWidth - .5) * 2; pointerY = (event.clientY / innerHeight - .5) * 2; });
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

  function animate() {
    requestAnimationFrame(animate); time += .01;
    world.rotation.y += (yaw + pointerX * .035 - world.rotation.y) * .025;
    world.position.y += (-pointerY * .18 - world.position.y) * .025;
    world.children.forEach((object, index) => { if (object.geometry && object.geometry.type === 'PlaneGeometry' && mode === 'sea') object.position.y = Math.sin(time * 1.5 + index) * .06; });
    if (waveMesh) { const positions = waveMesh.geometry.attributes.position; for (let i = 0; i < positions.count; i++) { const x = positions.getX(i); const y = positions.getY(i); positions.setZ(i, Math.sin(x * .16 + time) * .12 + Math.cos(y * .12 + time * 1.3) * .1); } positions.needsUpdate = true; waveMesh.geometry.computeVertexNormals(); }
    if (starField) starField.rotation.y += .00035;
    solarBodies.forEach(body => { body.orbit.rotation.y += body.speed; body.planet.rotation.y += .006; });
    galaxySystems.forEach(item => { item.galaxy.rotation.y += item.speed; item.galaxy.rotation.z += item.speed * .35; });
    const desiredX = Math.sin(yaw) * distance; const desiredZ = Math.cos(yaw) * distance; const desiredY = 5 + Math.sin(pitch) * 8;
    camera.position.x += (desiredX - camera.position.x) * .035; camera.position.y += (desiredY - camera.position.y) * .035; camera.position.z += (desiredZ - camera.position.z) * .035; camera.lookAt(0, 1, -5); renderer.render(scene, camera);
  }
  animate();
})();
