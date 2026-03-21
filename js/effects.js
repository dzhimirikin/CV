(function(){

  /* ============================================================
     СЕЗОН
  ============================================================ */

  const month = 2; // new Date().getMonth();

  const isWinter = (month === 11 || month === 0 || month === 1);
  const isSpring = (month === 2 || month === 3 || month === 4);
  const isSummer = (month === 5 || month === 6 || month === 7);
  const isAutumn = (month === 8 || month === 9 || month === 10);

  /* ============================================================
     НАСТРОЙКИ
  ============================================================ */

  let symbols = [];
  let interval = 200;
  let minSize = 10;
  let sizeVar = 20;
  let minDuration = 8000;
  let durationVar = 8000;
  let wind = 40;

  /* ============================================================
     СЕЗОНЫ
  ============================================================ */

  if(isWinter){
    symbols = ["❄","❅","❆"];
    interval = 180;
    minSize = 8;
    sizeVar = 30;
  } else if(isSpring){
    interval = 15;
    minSize = 10;
    sizeVar = 10;
    wind = 5;
    minDuration = 700;
    durationVar = 500;
  } else if(isSummer){
    interval = 120;
    minSize = 40;
    sizeVar = 80;
    wind = 6;
    minDuration = 10000;
    durationVar = 6000;
  } else if(isAutumn){
    symbols = [
      "Effects/Leaf_01_1.png",
      "Effects/Leaf_02_1.png",
      "Effects/Leaf_03_1.png"
    ];
    interval = 1500;
    minSize = 50;
    sizeVar = 30;
    minDuration = 16000;
    durationVar = 8000;
  }

  /* ============================================================
     ЗОНЫ
  ============================================================ */

  function getZone(){
    const zonesEls = document.querySelectorAll("[data-effects]");
    if(!zonesEls.length){
      return null;
    }

    const el = zonesEls[Math.floor(Math.random() * zonesEls.length)];
    const rect = el.getBoundingClientRect();

    return rect;
  }

  /* ============================================================
     АНИМАЦИЯ
  ============================================================ */

  function animate(el){
    const duration = minDuration + Math.random()*durationVar;
    let start = null;

    function frame(time){
      if(!start) start = time;

      const progress = time - start;
      const zone = el._zone;

      const y = progress / duration * zone.height;

      let sway = Math.sin(progress/800) * wind;
      let rotate = progress / 40;

      if(isSpring){
        sway = wind * 0.2;
        rotate = 0;
      }

      if(isSummer){
        sway += Math.sin(progress/2000) * 40;
        rotate = 0;
      }

      el.style.transform = `translate(${sway}px, ${y}px) rotate(${rotate}deg)`;

      if(progress < duration){
        requestAnimationFrame(frame);
      } else {
        el.remove();
      }
    }

    requestAnimationFrame(frame);
  }

  /* ============================================================
     СОЗДАНИЕ
  ============================================================ */

  function create(){

    /* ================= ОСЕНЬ ================= */

    if(isAutumn){
      const img = document.createElement("img");
      img.src = symbols[Math.floor(Math.random()*symbols.length)];

      const size = minSize + Math.random()*sizeVar;

      img.style.position = "fixed";

      const zone = getZone();
      if(!zone){
        img.remove();
        return;
      }

      img.style.top = zone.top + "px";
      img.style.left = (zone.left + Math.random() * zone.width) + "px";

      img._zone = zone;

      img.style.width = size + "px";
      img.style.height = "auto";

      img.style.pointerEvents = "none";
      img.style.userSelect = "none";
      img.style.zIndex = "9999";

      img.style.opacity = 0.2 + Math.random()*0.4;

      img.style.background = "transparent";
      img.style.border = "none";
      img.style.boxShadow = "none";

      document.body.appendChild(img);
      animate(img);

      return;
    }

    /* ===== остальные сезоны ===== */

    const el = document.createElement("div");
    el.style.position = "fixed";

    const zone = getZone();
    if(!zone){
      el.remove();
      return;
    }

    el.style.top = zone.top + "px";
    el.style.left = (zone.left + Math.random() * zone.width) + "px";

    el._zone = zone;

    el.style.pointerEvents = "none";
    el.style.userSelect = "none";
    el.style.zIndex = "9999";

    const size = minSize + Math.random()*sizeVar;

    /* ================= ВЕСНА ================= */

    if(isSpring){

    const length = size * (2 + Math.random()*2);
    el.style.width = (1 + Math.random()*1) + "px";
    el.style.height = length + "px";

    /* более естественный цвет */
    el.style.background = "linear-gradient(to bottom, rgba(180,200,255,0), rgba(180,200,255,0.6))";

    el.style.borderRadius = "2px";

    /* мягкость */

    el.style.opacity = 0.2 + Math.random()*0.3;


    /* легкое размытие движения */

    el.style.filter = "blur(0.5px)";
    }

    /* ================= ЛЕТО ================= */

    else if(isSummer){
      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.borderRadius = "50%";
      el.style.background = `radial-gradient(circle, rgba(255,255,220,0.35) 0%, rgba(255,255,220,0.2) 25%, rgba(255,255,220,0.08) 50%, rgba(255,255,220,0.02) 70%, transparent 100%)`;
      el.style.filter = "blur(6px)";
      el.style.mixBlendMode = "screen";
      el.style.opacity = 0.15 + Math.random()*0.25;
    }

    /* ================= ЗИМА ================= */

    else{
      el.innerHTML = symbols[Math.floor(Math.random()*symbols.length)];
      el.style.fontSize = size + "px";
      el.style.color = "#ffffff";

      /* было 0.4–1.0 → делаем слабее */
      el.style.opacity = 0.2 + Math.random()*0.3;

      el.style.mixBlendMode = "normal";

      /* уменьшаем свечение */
      el.style.textShadow = "0 0 3px rgba(255,255,255,0.4)";
    }

    document.body.appendChild(el);
    animate(el);
  }

  /* ============================================================
     СТАРТ
  ============================================================ */

  setInterval(create, interval);

})();