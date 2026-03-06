(function () {
  const hero = document.querySelector('.home-hero-section, .hero');
  if (!hero) return;

  // Cria e injeta o canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'starfield';
  hero.prepend(canvas);

  const ctx = canvas.getContext('2d');

  let W, H, stars = [], shootingStars = [];
  let mouseX = 0, mouseY = 0;

  // --- Config ---
  const STAR_COUNT   = 280;
  const LAYERS       = [
    { speed: 0.015, size: 0.6, alpha: 0.5 },  // fundo
    { speed: 0.030, size: 1.1, alpha: 0.75 }, // meio
    { speed: 0.055, size: 1.8, alpha: 1.0 },  // frente
  ];
  const SHOOTING_INTERVAL = 3500; // ms entre estrelas cadentes

  // --- Resize ---
  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  // --- Cria estrelas ---
    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            const layer = LAYERS[Math.floor(Math.random() * LAYERS.length)];
            stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * layer.speed * 0.9,
            vy: (Math.random() - 0.5) * layer.speed * 0.5,
            size: layer.size * (0.7 + Math.random() * 0.6),
            alpha: layer.alpha * (0.6 + Math.random() * 0.4),
            twinkleSpeed: 0.005 + Math.random() * 0.015,
            twinkleOffset: Math.random() * Math.PI * 2,
            layer,
            });
        }
    }

  // --- Estrela cadente ---
  function spawnShootingStar() {
    const startX = Math.random() * W * 0.7;
    const startY = Math.random() * H * 0.3;
    shootingStars.push({
      x: startX, y: startY,
      vx: 4 + Math.random() * 4,
      vy: 2 + Math.random() * 3,
      len: 80 + Math.random() * 80,
      alpha: 1,
      fade: 0.012 + Math.random() * 0.01,
    });
  }

  // --- Loop principal ---
  let frame = 0;
 function draw() {
  ctx.clearRect(0, 0, W, H);

  frame++;

  stars.forEach(s => {
    // --- Movimento contínuo ---
    s.x += s.vx;
    s.y += s.vy;

    // Wrap-around: sai de um lado, entra do outro
    if (s.x < -2)  s.x = W + 2;
    if (s.x > W+2) s.x = -2;
    if (s.y < -2)  s.y = H + 2;
    if (s.y > H+2) s.y = -2;

    // --- Twinkle ---
    const twinkle = Math.sin(frame * s.twinkleSpeed + s.twinkleOffset);
    const a = s.alpha * (0.75 + 0.25 * twinkle);

    // Halo para estrelas maiores
    if (s.size > 1.3) {
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
      grad.addColorStop(0, `rgba(200, 210, 255, ${a * 0.5})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210, 220, 255, ${a})`;
    ctx.fill();
  });

  // --- Estrelas cadentes ---
  shootingStars = shootingStars.filter(s => s.alpha > 0);
  shootingStars.forEach(s => {
    const tailX = s.x - s.vx * (s.len / s.vx);
    const tailY = s.y - s.vy * (s.len / s.vx);

    const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(1, `rgba(255, 240, 200, ${s.alpha})`);

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(s.x, s.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    s.x += s.vx;
    s.y += s.vy;
    s.alpha -= s.fade;
  });

  requestAnimationFrame(draw);
}


  // --- Shooting star timer ---
  setInterval(spawnShootingStar, SHOOTING_INTERVAL);

  // --- Init ---
  window.addEventListener('resize', () => { resize(); createStars(); });
  resize();
  createStars();
  spawnShootingStar(); // primeira imediatamente
  draw();
})();