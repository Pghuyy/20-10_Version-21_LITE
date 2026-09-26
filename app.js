```javascript
const $ = s => document.querySelector(s);

const field = $('#heartField');
const searchWrap = $('#searchWrap');
const searchInput = $('#searchInput');

const letter = $('#letter');
const paper = document.querySelector('.letter-paper');
const subject = $('#letterSubject');
const greeting = $('#letterGreeting');
const body = $('#letterBody');
const sign = $('#letterSign');

const burstLayer = $('#burstLayer');

let timers = [];
let lastScroll = 0;
let audioCtx = null;
let typingRAF = null;
let busy = false;
let lastTrailAt = 0;
let secretFound = false;
let currentLetterData = null;

const reducedMotion =
  matchMedia('(prefers-reduced-motion: reduce)').matches;

const lowPower =
  reducedMotion ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 2);

if(lowPower){
  document.documentElement.classList.add('low-power');
}


/* =========================================================
   BONUS MESSAGES
========================================================= */

const bonusPool = [
  'Mong hôm nay bạn có một khoảnh khắc rất nhỏ thôi, nhưng đủ để tự nhiên mỉm cười.',
  'Có thể bạn không để ý, nhưng sự vui vẻ của một người đôi khi làm cả một ngày học nhẹ đi rất nhiều.',
  'Giữ lại những điều khiến bạn cười thật lòng nhé. Những điều ấy thường đáng nhớ hơn mình nghĩ.',
  'Nếu hôm nay hơi mệt, cho mình chậm lại một chút cũng chẳng sao. Ngày mai mình lại tiếp tục.',
  'Mong bạn luôn có một góc nhỏ để làm điều mình thích, kể cả giữa những ngày đầy bài vở.',
  'Có những ngày chẳng có gì đặc biệt, nhưng biết đâu sau này lại là những ngày mình nhớ nhất.',
  'Mong bạn gặp thật nhiều người tử tế, và cũng luôn giữ được sự tử tế rất riêng của mình.',
  'Đừng quên tự thưởng cho mình những niềm vui nhỏ sau những ngày cố gắng nhé.',
  'Mong mỗi lần nhìn lại năm học này, bạn sẽ nhớ nhiều tiếng cười hơn những lần mệt.',
  'Có một điều nhỏ: bạn không cần lúc nào cũng thật hoàn hảo mới có một ngày thật vui.',
  'Mong những điều bạn đang chờ sẽ đến vào một thời điểm thật đẹp.',
  'Nếu có một ngày mọi thứ hơi rối, cứ làm từng việc một. Rồi mọi thứ sẽ dần ổn thôi.',
  'Mong bạn luôn có những người khiến giờ ra chơi cũng trở nên đáng mong chờ.',
  'Giữ lấy những khoảnh khắc vô tri, những câu chuyện linh tinh và cả những trận cười không báo trước nhé.',
  'Mong bạn có đủ tự tin để chọn điều mình thích, và đủ bình tĩnh để chờ điều mình cần.',
  'Một lời nhắn nhỏ thôi: những ngày bình thường cũng xứng đáng được vui.',
  'Mong bạn luôn tìm được một lý do nhỏ để thấy hôm nay dễ thương hơn hôm qua.',
  'Nếu có điều gì khiến bạn vui, cứ vui thật nhiều. Không cần một lý do thật lớn đâu.',
  'Mong những ngày tới có thêm vài bất ngờ dễ thương mà bạn hoàn toàn không đoán trước được.',
  'Hãy giữ lại phiên bản mình biết cười vì những chuyện rất ngớ ngẩn nhé.',
  'Mong bạn học được nhiều điều hay, nhưng cũng đừng quên có thật nhiều chuyện vui để kể.',
  'Có thể một ngày nào đó bạn sẽ nhớ những điều rất nhỏ của 10B4. Mong khi ấy bạn sẽ mỉm cười.',
  'Mong bạn luôn có đủ năng lượng cho những điều mình thật sự muốn làm.',
  'Nếu cần một ngày thật chậm, cứ cho mình một ngày như thế. Không phải lúc nào cũng cần chạy.',
  'Mong những điều tốt đẹp đến với bạn theo cách nhẹ nhàng nhất.',
  'Giữa rất nhiều việc phải làm, nhớ chừa một chút chỗ cho niềm vui nhé.',
  'Mong bạn có thật nhiều ngày mà việc đầu tiên muốn làm là bật cười.',
  'Có những điều chẳng cần nói thành lời vẫn khiến người ta thấy ấm lòng. Mong bạn gặp thật nhiều điều như thế.',
  'Mong mỗi tuần đều có ít nhất một chuyện khiến bạn muốn kể lại cho bạn bè.',
  'Nếu hôm nay chưa vui lắm thì cũng không sao. Còn rất nhiều ngày khác đang chờ.',
  'Mong bạn luôn giữ được sự tò mò với những điều mới và sự dịu dàng với chính mình.',
  'Một ngày đẹp không nhất thiết phải thật đặc biệt. Đôi khi chỉ cần có một tiếng cười đúng lúc.',
  'Mong bạn có những người bạn có thể cười thật to mà chẳng cần giữ ý.',
  'Chúc bạn luôn đủ can đảm để thử, đủ kiên nhẫn để chờ và đủ vui để tận hưởng.',
  'Mong những kỷ niệm đẹp của tuổi học trò đến với bạn thật tự nhiên, chẳng cần cố tìm.',
  'Nếu có một điều đáng giữ lại, tôi mong đó là những lần bạn cười đến quên cả mệt.',
  'Mong bạn có thật nhiều khoảnh khắc nhỏ mà sau này nghĩ lại vẫn thấy: ừ, ngày ấy vui thật.',
  'Hãy để những ngày sắp tới có thêm một chút ngẫu hứng, một chút bất ngờ và thật nhiều tiếng cười.',
  'Mong bạn luôn biết rằng những niềm vui nhỏ cũng đáng được trân trọng.',
  'Và cuối cùng, mong bạn có một 20/10 thật vui — theo đúng cách khiến bạn thấy vui nhất.'
];

function bonusFor(d){
  if(d.teacher){
    return 'Mong cô cũng có những khoảng thời gian thật nhẹ nhàng cho riêng mình, với nhiều niềm vui nhỏ sau những ngày bận rộn cùng lớp.';
  }

  const n =
    Number(String(d.id).match(/\d+$/)?.[0] || 1)-1;

  return bonusPool[Math.max(0,n)%bonusPool.length];
}


/* =========================================================
   GENERAL HELPERS
========================================================= */

const performanceCount = (normal,low) =>
  lowPower ? low : normal;

const later = (fn,ms) => {
  const t = setTimeout(fn,ms);
  timers.push(t);
  return t;
};

const mobile = () =>
  matchMedia('(max-width:650px)').matches;

function clearTimers(){
  timers.forEach(clearTimeout);
  timers = [];
}


/* =========================================================
   AUDIO
========================================================= */

function ensureAudio(){
  try{
    audioCtx ||= new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

    if(audioCtx.state==='suspended'){
      audioCtx.resume();
    }

    return audioCtx;

  }catch(e){
    return null;
  }
}

function tone(
  freq,
  dur=.08,
  gain=.04,
  type='sine',
  delay=0
){
  const a = ensureAudio();

  if(!a)return;

  const now = a.currentTime+delay;

  const o = a.createOscillator();
  const g = a.createGain();

  o.type = type;
  o.frequency.setValueAtTime(freq,now);

  g.gain.setValueAtTime(.0001,now);

  g.gain.exponentialRampToValueAtTime(
    gain,
    now+.008
  );

  g.gain.exponentialRampToValueAtTime(
    .0001,
    now+dur
  );

  o.connect(g);
  g.connect(a.destination);

  o.start(now);
  o.stop(now+dur+.02);
}

function openingSound(){

  [261.63,329.63,392,523.25,659.25,783.99]
    .forEach((f,i)=>{
      tone(
        f,
        .28,
        .045,
        i%2 ? 'triangle' : 'sine',
        i*.065
      );
    });
}

function keySound(ch){

  if(!ch.trim())return;

  const punct =
    /[.,!?;:—–…]/.test(ch);

  tone(
    punct
      ? 510
      : 650+Math.random()*170,

    punct ? .045 : .055,

    mobile()
      ? (punct ? .018 : .035)
      : (punct ? .012 : .024),

    'triangle'
  );
}

function haptic(ms=12){

  try{
    if(navigator.vibrate){
      navigator.vibrate(ms);
    }
  }catch(e){}
}


/* =========================================================
   AMBIENT HEARTS
========================================================= */

function ambientHearts(){

  const box = $('#ambientHearts');

  if(!box)return;

  box.innerHTML = '';

  const count =
    mobile()
      ? performanceCount(30,18)
      : performanceCount(68,40);

  const frag =
    document.createDocumentFragment();

  for(let i=0;i<count;i++){

    const h =
      document.createElement('span');

    h.className = 'ambient-heart';

    h.textContent =
      i%7===0 ? '♥' : '♡';

    h.style.left =
      Math.random()*100+'%';

    h.style.top =
      Math.random()*100+'%';

    h.style.setProperty(
      '--size',
      (mobile()?8:10)+
      Math.random()*(mobile()?18:25)+'px'
    );

    h.style.setProperty(
      '--dur',
      (12+Math.random()*14)+'s'
    );

    h.style.setProperty(
      '--delay',
      (-Math.random()*24)+'s'
    );

    h.style.setProperty(
      '--opacity',
      (.15+Math.random()*.23).toFixed(2)
    );

    h.style.setProperty(
      '--drift',
      (Math.random()*70-35)+'px'
    );

    frag.appendChild(h);
  }

  box.appendChild(frag);
}


/* =========================================================
   HEART SVG
========================================================= */

const heartSVG = `
<svg
  viewBox="0 0 64 58"
  focusable="false"
  aria-hidden="true">
  <path d="
    M32 54.5
    7.3 30.8
    C-3.1 20.7 1.1 3.4 15.1 2.2
    C23.2 1.5 28.6 6.2 32 11.1
    C35.4 6.2 40.8 1.5 48.9 2.2
    c14 1.2 18.2 18.5 7.8 28.6
    L32 54.5Z
  "/>
</svg>`;


/* =========================================================
   HEART POSITIONS
========================================================= */

function positions(n){

  const m = mobile();

  const cols = m ? 3 : 5;
  const rowGap = m ? 104 : 138;

  return Array.from(
    {length:n},
    (_,i)=>{

      const row =
        Math.floor(i/cols);

      const col =
        i%cols;

      let x =
        (col+.5)/cols*100+
        (row%2 ? 2.5 : -2.5)+
        Math.sin(i*2.31)*2.8;

      if(m){
        x = Math.max(
          14,
          Math.min(86,x)
        );
      }else{
        x = Math.max(
          9,
          Math.min(91,x)
        );
      }

      return {
        x,
        y:
          18+
          row*rowGap+
          Math.sin(i*1.8)*8,

        dy:
          Math.cos(i*1.4)*4,

        delay:
          -i*.17
      };
    }
  );
}


/* =========================================================
   RENDER
========================================================= */

function render(list){

  field.innerHTML = '';

  $('#count').textContent =
    list.length===girls.length
      ? '40 trái tim · mỗi trái tim là một lá thư'
      : `${list.length} kết quả`;

  field.style.height =
    (
      18+
      Math.ceil(
        list.length/(mobile()?3:5)
      )*
      (mobile()?104:138)+
      70
    )+'px';

  const ps =
    positions(list.length);

  const frag =
    document.createDocumentFragment();

  list.forEach((d,i)=>{

    const p = ps[i];

    const b =
      document.createElement('button');

    b.type = 'button';

    b.className =
      'heart-bubble';

    b.style.left =
      p.x+'%';

    b.style.top =
      p.y+'px';

    b.style.setProperty(
      '--dy',
      p.dy+'px'
    );

    b.style.setProperty(
      '--delay',
      p.delay+'s'
    );

    b.dataset.id = d.id;

    b.setAttribute(
      'aria-label',
      'Mở thư của '+d.name
    );

    b.innerHTML =
      `<span class="heart-icon">
        ${heartSVG}<i></i>
      </span>
      <span class="heart-label">
        ${d.name}
      </span>`;

    b.addEventListener(
      'click',
      ()=>choose(d,b)
    );

    frag.appendChild(b);
  });

  field.appendChild(frag);

  const oldSecret =
    field.querySelector('.secret-heart');

  if(oldSecret){
    oldSecret.remove();
  }

  if(list.length===girls.length){

    const s =
      document.createElement('button');

    s.type='button';

    s.className =
      'secret-heart';

    s.textContent='♡';

    s.setAttribute(
      'aria-label',
      'Một điều nhỏ bí mật'
    );

    s.addEventListener(
      'click',
      findSecret
    );

    field.appendChild(s);
  }
}


/* =========================================================
   THE BIG CINEMATIC WAVE
========================================================= */

function burst(x,y){

  /*
    OLD PROBLEM:
    - ripple có nhưng cảm giác nhỏ
    - nhiều vòng nhưng thiếu "sự kiện"
    - bubble bay quanh tâm rồi biến mất
    - thư xuất hiện quá nhanh

    NEW:
    1. flash tại điểm chạm
    2. shockwave cực lớn
    3. nhiều lớp glow
    4. particles bị đẩy ra
    5. trái tim đi theo sóng
    6. màn hình rung nhẹ
    7. rồi mới mở thư
  */

  burstLayer.innerHTML='';

  burstLayer.classList.add(
    'active',
    'water-mode'
  );

  burstLayer.style.setProperty(
    '--ox',
    x+'px'
  );

  burstLayer.style.setProperty(
    '--oy',
    y+'px'
  );

  /*
    Chúng ta dùng chính CSS hiện tại
    làm nền, còn JS tạo các lớp phụ
    bằng style trực tiếp.
  */

  const frag =
    document.createDocumentFragment();


  /* -------------------------------------
     1. CORE FLASH
  ------------------------------------- */

  const flash =
    document.createElement('div');

  flash.style.position='fixed';
  flash.style.left=x+'px';
  flash.style.top=y+'px';
  flash.style.width='18px';
  flash.style.height='18px';
  flash.style.borderRadius='50%';
  flash.style.pointerEvents='none';
  flash.style.zIndex='9999';

  flash.style.background=
    'radial-gradient(circle,rgba(255,255,255,.98) 0%,rgba(255,205,225,.9) 25%,rgba(255,120,180,.35) 55%,transparent 75%)';

  flash.style.boxShadow=
    '0 0 18px rgba(255,255,255,.95),' +
    '0 0 55px rgba(255,100,170,.75),' +
    '0 0 110px rgba(255,120,190,.48)';

  flash.style.transform=
    'translate(-50%,-50%) scale(.3)';

  flash.style.transition=
    'transform .42s cubic-bezier(.16,1,.3,1),' +
    'opacity .55s ease';

  frag.appendChild(flash);


  /* -------------------------------------
     2. GIANT HALO
  ------------------------------------- */

  const halo =
    document.createElement('div');

  halo.style.position='fixed';
  halo.style.left=x+'px';
  halo.style.top=y+'px';
  halo.style.width='10px';
  halo.style.height='10px';
  halo.style.borderRadius='50%';
  halo.style.pointerEvents='none';
  halo.style.zIndex='9997';

  halo.style.background=
    'radial-gradient(circle,' +
    'rgba(255,255,255,.62) 0%,' +
    'rgba(255,180,215,.35) 20%,' +
    'rgba(255,130,190,.15) 42%,' +
    'transparent 72%)';

  halo.style.transform=
    'translate(-50%,-50%) scale(.5)';

  halo.style.transition=
    'transform 1.45s cubic-bezier(.12,.75,.18,1),' +
    'opacity 1.5s ease';

  frag.appendChild(halo);


  /* -------------------------------------
     3. HUGE RINGS
  ------------------------------------- */

  const farX =
    Math.max(
      x,
      innerWidth-x
    );

  const farY =
    Math.max(
      y,
      innerHeight-y
    );

  const maxRadius =
    Math.hypot(farX,farY)*1.55;

  const ringCount =
    mobile() ? 7 : 9;

  for(let i=0;i<ringCount;i++){

    const ring =
      document.createElement('div');

    ring.style.position='fixed';

    ring.style.left=x+'px';
    ring.style.top=y+'px';

    ring.style.width='30px';
    ring.style.height='30px';

    ring.style.borderRadius='50%';

    ring.style.pointerEvents='none';

    ring.style.zIndex='9996';

    const strong =
      i===0;

    ring.style.border =
      strong
        ? '3px solid rgba(255,255,255,.95)'
        : '2px solid rgba(255,165,205,.48)';

    ring.style.boxShadow =
      strong
        ? '0 0 20px rgba(255,255,255,.9),' +
          '0 0 50px rgba(255,100,170,.7)'
        : '0 0 22px rgba(255,120,180,.35)';

    ring.style.transform =
      'translate(-50%,-50%) scale(.1)';

    ring.style.opacity =
      strong ? '1' : '.78';

    ring.style.transition =
      `transform ${1.55+i*.14}s cubic-bezier(.08,.72,.16,1) ${i*.105}s,`+
      `opacity ${1.45+i*.12}s ease ${i*.105}s`;

    frag.appendChild(ring);

    later(()=>{

      ring.style.transform =
        `translate(-50%,-50%) scale(${Math.max(
          12,
          maxRadius/15
        )*(1+i*.17)})`;

      ring.style.opacity =
        i===0 ? '0' : '.04';

    },20);
  }


  /* -------------------------------------
     4. PARTICLES
  ------------------------------------- */

  const particleCount =
    mobile() ? 24 : 42;

  for(let i=0;i<particleCount;i++){

    const p =
      document.createElement('span');

    p.textContent =
      i%8===0 ? '✦' :
      i%5===0 ? '·' :
      '•';

    p.style.position='fixed';
    p.style.left=x+'px';
    p.style.top=y+'px';

    p.style.pointerEvents='none';

    p.style.zIndex='10000';

    p.style.fontSize =
      (2+Math.random()*(mobile()?5:8))+'px';

    p.style.color =
      i%4===0
        ? 'rgba(255,255,255,.95)'
        : 'rgba(255,175,215,.8)';

    p.style.textShadow=
      '0 0 10px rgba(255,120,190,.9)';

    p.style.transform=
      'translate(-50%,-50%) scale(.2)';

    p.style.opacity='0';

    frag.appendChild(p);

    const angle =
      Math.random()*Math.PI*2;

    const distance =
      maxRadius*
      (.35+Math.random()*.55);

    const dx =
      Math.cos(angle)*distance;

    const dy =
      Math.sin(angle)*distance;

    later(()=>{

      p.style.opacity=
        String(.35+Math.random()*.6);

      p.style.transition=
        'transform 1.5s cubic-bezier(.12,.8,.2,1),' +
        'opacity 1.7s ease';

      p.style.transform=
        `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1)`;

    },220+Math.random()*450);

    later(()=>{
      p.style.opacity='0';
    },1250+Math.random()*500);
  }


  /* -------------------------------------
     5. HEARTS FOLLOW THE WAVE
  ------------------------------------- */

  const heartCount =
    mobile() ? 10 : 17;

  for(let i=0;i<heartCount;i++){

    const h =
      document.createElement('span');

    h.textContent =
      i%4===0 ? '♥' : '♡';

    h.style.position='fixed';

    h.style.left=x+'px';
    h.style.top=y+'px';

    h.style.zIndex='10001';

    h.style.pointerEvents='none';

    h.style.fontSize =
      (8+Math.random()*12)+'px';

    h.style.color =
      i%3===0
        ? 'rgba(255,255,255,.95)'
        : 'rgba(255,170,210,.82)';

    h.style.textShadow=
      '0 0 14px rgba(255,100,180,.8)';

    h.style.transform=
      'translate(-50%,-50%) scale(.3)';

    h.style.opacity='0';

    frag.appendChild(h);

    const angle =
      (Math.PI*2*i/heartCount)+
      (Math.random()-.5)*.5;

    const distance =
      maxRadius*
      (.18+Math.random()*.45);

    const dx =
      Math.cos(angle)*distance;

    const dy =
      Math.sin(angle)*distance;

    later(()=>{

      h.style.opacity='1';

      h.style.transition=
        'transform 1.75s cubic-bezier(.1,.8,.18,1),' +
        'opacity 1.8s ease';

      h.style.transform=
        `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${Math.random()*80-40}deg) scale(1)`;

    },350+Math.random()*350);

    later(()=>{
      h.style.opacity='0';
    },1500+Math.random()*500);
  }


  /* -------------------------------------
     6. LIGHT SWEEP
  ------------------------------------- */

  const sweep =
    document.createElement('div');

  sweep.style.position='fixed';
  sweep.style.inset='-40%';

  sweep.style.pointerEvents='none';

  sweep.style.zIndex='9995';

  sweep.style.background=
    'radial-gradient(circle at '+(
      x/innerWidth*100
    )+'% '+(
      y/innerHeight*100
    )+'%,rgba(255,210,230,.34),transparent 27%)';

  sweep.style.opacity='0';

  sweep.style.transition=
    'opacity .45s ease,transform 1.7s ease';

  frag.appendChild(sweep);


  burstLayer.appendChild(frag);


  /* -------------------------------------
     START THE WHOLE EVENT
  ------------------------------------- */

  requestAnimationFrame(()=>{

    flash.style.transform=
      'translate(-50%,-50%) scale(14)';

    flash.style.opacity='0';

    halo.style.transform=
      'translate(-50%,-50%) scale(125)';

    halo.style.opacity='0';

    sweep.style.opacity='1';
    sweep.style.transform='scale(1.7)';

  });


  /* -------------------------------------
     CAMERA-LIKE MICRO SHAKE
  ------------------------------------- */

  if(!reducedMotion){

    document.documentElement.animate(
      [
        {
          transform:'translate3d(0,0,0)'
        },
        {
          transform:'translate3d(-3px,2px,0)'
        },
        {
          transform:'translate3d(3px,-2px,0)'
        },
        {
          transform:'translate3d(-2px,-1px,0)'
        },
        {
          transform:'translate3d(0,0,0)'
        }
      ],
      {
        duration:560,
        easing:'cubic-bezier(.2,.8,.2,1)'
      }
    );
  }


  /* -------------------------------------
     CLEANUP
  ------------------------------------- */

  later(()=>{

    burstLayer.classList.remove(
      'active',
      'water-mode'
    );

    burstLayer.innerHTML='';

  },3100);
}


/* =========================================================
   LETTER TYPING
========================================================= */

function clearTyping(){

  if(typingRAF){

    cancelAnimationFrame(
      typingRAF
    );

    typingRAF=null;
  }

  timers.forEach(clearTimeout);

  timers=[];

  document
    .querySelectorAll('.letter-progress i')
    .forEach(
      x=>x.style.width='0%'
    );
}

function typeLetter(d){

  greeting.textContent='';
  body.innerHTML='';

  sign.classList.remove('show');

  const progress =
    document.querySelector(
      '.letter-progress i'
    );

  const paras=[
    d.greeting,
    ...d.paragraphs
  ];

  const nodes=[
    greeting,
    ...d.paragraphs.map(
      ()=>document.createElement('p')
    )
  ];

  d.paragraphs.forEach((_,i)=>{

    nodes[i+1].className =
      'letter-paragraph';

    body.appendChild(
      nodes[i+1]
    );
  });

  const texts =
    paras.map(
      x=>String(x||'')
    );

  const totalDuration =
    mobile()
      ? 18000
      : 16500;

  const paragraphGap =
    mobile()
      ? 620
      : 520;

  const totalGaps =
    paragraphGap*3;

  const typingDuration =
    totalDuration-totalGaps;

  let elapsed=0;

  let last=
    performance.now();

  let lastSound=0;

  let lastVisible=0;

  const flat=[];

  texts.forEach((text,pi)=>{

    for(
      let ci=0;
      ci<text.length;
      ci++
    ){

      flat.push({
        pi,
        ci,
        text
      });
    }
  });

  const weightAt=item=>{

    const ch=
      item.text[item.ci];

    if(/[.!?…]/.test(ch))
      return 2;

    if(/[,;:—–]/.test(ch))
      return 1.35;

    if(ch===' ')
      return .42;

    return 1;
  };

  const weights=
    flat.map(weightAt);

  const weightTotal=
    weights.reduce(
      (a,b)=>a+b,
      0
    );

  const step=now=>{

    const dt=
      Math.min(
        80,
        now-last
      );

    last=now;

    elapsed+=dt;

    const typingElapsed=
      Math.max(
        0,
        elapsed-totalGaps*.12
      );

    const t=
      Math.min(
        1,
        typingElapsed/typingDuration
      );

    const eased=
      t<.5
        ? 2*t*t
        : 1-
          Math.pow(
            -2*t+2,
            2
          )/2;

    const targetWeight=
      eased*weightTotal;

    let acc=0;
    let targetIndex=0;

    for(
      let i=0;
      i<weights.length;
      i++
    ){

      acc+=weights[i];

      if(acc>=targetWeight){

        targetIndex=i+1;
        break;
      }

      targetIndex=
        weights.length;
    }

    while(
      lastVisible<targetIndex
    ){

      const item=
        flat[lastVisible++];

      const ch=
        item.text[item.ci];

      const node=
        nodes[item.pi];

      /*
        Chữ mới xuất hiện:
        - hơi mờ
        - hơi phóng to
        - sáng nhẹ
        - rồi trở về bình thường
      */

      if(ch.trim()){

        const span=
          document.createElement(
            'span'
          );

        span.textContent=ch;

        span.style.display=
          'inline-block';

        span.style.opacity='0';

        span.style.transform=
          'translateY(2px) scale(1.045)';

        span.style.filter=
          'blur(2px)';

        span.style.textShadow=
          '0 0 12px rgba(255,150,190,.45)';

        span.style.transition=
          'opacity .18s ease,'+
          'transform .28s cubic-bezier(.2,.8,.2,1),'+
          'filter .28s ease,'+
          'text-shadow .4s ease';

        node.appendChild(span);

        requestAnimationFrame(()=>{

          span.style.opacity='1';

          span.style.transform=
            'translateY(0) scale(1)';

          span.style.filter=
            'blur(0)';

          span.style.textShadow=
            '0 0 0 transparent';
        });

      }else{

        node.appendChild(
          document.createTextNode(' ')
        );
      }

      if(
        ch.trim() &&
        (
          lastVisible-lastSound>=2 ||
          /[.!?]/.test(ch)
        )
      ){

        keySound(ch);

        lastSound=
          lastVisible;
      }
    }

    if(progress){

      progress.style.width=
        Math.round(
          Math.min(
            100,
            t*100
          )
        )+'%';
    }

    if(t>=1){

      nodes.forEach((n,i)=>{

        n.textContent=
          texts[i];

        n.classList.remove(
          'typing'
        );

        n.classList.add(
          'settled'
        );
      });

      if(progress){
        progress.style.width='100%';
      }

      later(()=>{

        sign.classList.add('show');

        paper.classList.add(
          'finished'
        );

        letter.classList.add(
          'finished'
        );

        showAfterLetter();

        tone(
          880,
          .16,
          .028,
          'sine'
        );

      },180);

      typingRAF=null;

      return;
    }

    typingRAF=
      requestAnimationFrame(step);
  };

  nodes[0].classList.add(
    'typing'
  );

  typingRAF=
    requestAnimationFrame(step);
}


/* =========================================================
   LETTER
========================================================= */

function show(d){

  clearTyping();

  currentLetterData=d;

  subject.textContent=
    d.subject;

  paper.classList.remove(
    'finished'
  );

  greeting.textContent='';

  body.innerHTML='';

  sign.textContent=
    d.sign ||
    'Từ 10B4, với một lời chúc nhỏ ♡';

  sign.classList.remove(
    'show'
  );

  letter.classList.toggle(
    'teacher-letter',
    !!d.teacher
  );

  paper.classList.toggle(
    'teacher-paper',
    !!d.teacher
  );

  letter.classList.remove(
    'finished'
  );

  hideAfterLetter();

  closeReply();

  letter.classList.add(
    'open'
  );

  letter.setAttribute(
    'aria-hidden',
    'false'
  );

  later(
    ()=>typeLetter(d),
    260
  );
}


/* =========================================================
   CHOOSE HEART
========================================================= */

function choose(d,b){

  if(busy)return;

  busy=true;

  lastScroll=
    scrollY;

  ensureAudio();

  openingSound();

  haptic(18);

  document
    .querySelectorAll(
      '.heart-bubble'
    )
    .forEach(x=>{
      x.classList.remove(
        'selected'
      );
    });

  b.classList.add(
    'selected'
  );

  field.classList.add(
    'choosing'
  );

  const r=
    b.getBoundingClientRect();

  /*
    TÂM CHÍNH XÁC
  */

  const x=
    r.left+
    r.width/2;

  const y=
    r.top+
    r.height/2;

  /*
    BIG WAVE
  */

  burst(x,y);

  /*
    THAY VÌ 1.52 GIÂY:
    cho người dùng thật sự nhìn
    thấy wave lan ra.
  */

  later(()=>{

    show(d);

    busy=false;

  },2050);
}


/* =========================================================
   AFTER LETTER
========================================================= */

function closeReply(){

  const el=
    $('#afterLetter');

  if(!el)return;

  el.classList.remove(
    'show'
  );

  el.setAttribute(
    'aria-hidden',
    'true'
  );
}

function showAfterLetter(){

  const el=
    $('#afterLetter');

  if(!el)return;

  el.classList.add(
    'show'
  );

  el.setAttribute(
    'aria-hidden',
    'false'
  );
}

function hideAfterLetter(){

  const el=
    $('#afterLetter');

  if(!el)return;

  el.classList.remove(
    'show'
  );

  el.setAttribute(
    'aria-hidden',
    'true'
  );
}


/* =========================================================
   CLOSE LETTER
========================================================= */

function closeLetter(){

  if(
    !letter.classList.contains(
      'open'
    )
  ){
    return;
  }

  clearTyping();

  letter.classList.add(
    'closing'
  );

  haptic(8);

  later(()=>{

    letter.classList.remove(
      'open',
      'teacher-letter',
      'closing',
      'finished'
    );

    paper.classList.remove(
      'teacher-paper',
      'finished'
    );

    hideAfterLetter();

    closeReply();

    closeBonus();

    currentLetterData=null;

    letter.setAttribute(
      'aria-hidden',
      'true'
    );

    field.classList.remove(
      'choosing'
    );

    burstLayer.innerHTML='';

    burstLayer.classList.remove(
      'active'
    );

    busy=false;

    render(
      searchInput.value
        ? girls.filter(x=>
            x.name
              .toLocaleLowerCase('vi')
              .includes(
                searchInput.value
                  .trim()
                  .toLocaleLowerCase('vi')
              )
          )
        : girls
    );

    later(
      ()=>scrollTo({
        top:lastScroll,
        behavior:'auto'
      }),
      80
    );

  },520);
}


/* =========================================================
   BONUS
========================================================= */

function openBonus(){

  if(!currentLetterData)
    return;

  const modal=
    $('#bonusModal');

  if(!modal)return;

  $('#bonusText').textContent=
    bonusFor(
      currentLetterData
    );

  $('#bonusTitle').textContent=
    currentLetterData.teacher
      ? 'Một điều nhỏ gửi cô.'
      : 'Một điều nhỏ dành riêng cho bạn.';

  modal.classList.add(
    'open'
  );

  modal.setAttribute(
    'aria-hidden',
    'false'
  );

  ensureAudio();

  tone(
    880,
    .13,
    .025,
    'sine'
  );
}

function closeBonus(){

  const m=
    $('#bonusModal');

  if(!m)return;

  m.classList.remove(
    'open'
  );

  m.setAttribute(
    'aria-hidden',
    'true'
  );
}


/* =========================================================
   REACTION
========================================================= */

function showReplyToast(text){

  const old=
    document.querySelector(
      '.reply-toast'
    );

  if(old)old.remove();

  const t=
    document.createElement(
      'div'
    );

  t.className=
    'reply-toast';

  t.textContent=text;

  document.body.appendChild(t);

  requestAnimationFrame(
    ()=>t.classList.add('show')
  );

  later(()=>{

    t.classList.remove(
      'show'
    );

    later(
      ()=>t.remove(),
      360
    );

  },1700);
}

function react(kind){

  const msgs={
    sweet:'♡ Đã nhận một chút dễ thương.',
    received:'✦ Đã nhận rồi nhé.',
    thanks:'🌷 10B4 nhận được lời hồi đáp.'
  };

  const colors={
    sweet:'♡',
    received:'✦',
    thanks:'🌷'
  };

  const layer=
    $('#touchTrail');

  if(
    layer &&
    !reducedMotion
  ){

    for(let i=0;i<6;i++){

      const h=
        document.createElement(
          'span'
        );

      h.className=
        'trail-heart';

      h.textContent=
        colors[kind];

      h.style.setProperty(
        '--x',
        (innerWidth-45)+'px'
      );

      h.style.setProperty(
        '--y',
        (innerHeight-58)+'px'
      );

      h.style.setProperty(
        '--dx',
        (Math.random()*60-30)+'px'
      );

      h.style.setProperty(
        '--dy',
        (-20-
          Math.random()*45
        )+'px'
      );

      h.style.setProperty(
        '--r',
        (Math.random()*30-15)+'deg'
      );

      layer.appendChild(h);

      later(
        ()=>h.remove(),
        800
      );
    }
  }

  ensureAudio();

  tone(
    kind==='received'
      ? 760
      : kind==='thanks'
        ? 620
        : 900,
    .14,
    .028,
    'sine'
  );

  haptic(8);

  showReplyToast(
    msgs[kind]
  );

  closeReply();
}


/* =========================================================
   SECRET
========================================================= */

function findSecret(){

  if(secretFound)return;

  secretFound=true;

  ensureAudio();

  tone(
    1046,
    .22,
    .035,
    'sine'
  );

  haptic(10);

  const toast=
    document.createElement(
      'div'
    );

  toast.className=
    'secret-toast';

  toast.textContent=
    'Bạn tìm thấy một điều mà không phải ai cũng để ý. ♡';

  document.body.appendChild(
    toast
  );

  requestAnimationFrame(
    ()=>toast.classList.add(
      'show'
    )
  );

  later(()=>{

    toast.classList.remove(
      'show'
    );

    later(
      ()=>toast.remove(),
      420
    );

  },2800);

  for(let i=0;i<8;i++){

    const h=
      document.createElement(
        'span'
      );

    h.className=
      'trail-heart';

    h.textContent=
      i%2 ? '♡' : '♥';

    h.style.setProperty(
      '--x',
      (innerWidth/2-5)+'px'
    );

    h.style.setProperty(
      '--y',
      (innerHeight-70)+'px'
    );

    h.style.setProperty(
      '--dx',
      Math.cos(
        i/8*Math.PI*2
      )*35+'px'
    );

    h.style.setProperty(
      '--dy',
      (
        -35-
        Math.sin(
          i/8*Math.PI*2
        )*28
      )+'px'
    );

    h.style.setProperty(
      '--r',
      (Math.random()*35-17)+'deg'
    );

    $('#touchTrail')
      .appendChild(h);

    later(
      ()=>h.remove(),
      800
    );
  }
}


/* =========================================================
   TRAIL
========================================================= */

function makeTrail(x,y){

  const layer=
    $('#touchTrail');

  if(
    !layer ||
    reducedMotion
  ){
    return;
  }

  const h=
    document.createElement(
      'span'
    );

  h.className=
    'trail-heart';

  h.textContent=
    Math.random()>.78
      ? '♥'
      : '♡';

  h.style.setProperty(
    '--x',
    x+'px'
  );

  h.style.setProperty(
    '--y',
    y+'px'
  );

  h.style.setProperty(
    '--dx',
    (Math.random()*26-13)+'px'
  );

  h.style.setProperty(
    '--dy',
    (-8-
      Math.random()*24
    )+'px'
  );

  h.style.setProperty(
    '--r',
    (Math.random()*40-20)+'deg'
  );

  layer.appendChild(h);

  later(
    ()=>h.remove(),
    720
  );
}


/* =========================================================
   EVENTS
========================================================= */

$('#finaleClose')
  .addEventListener(
    'click',
    closeFinale
  );

$('#bonusBtn')
  .addEventListener(
    'click',
    openBonus
  );

$('#bonusClose')
  .addEventListener(
    'click',
    closeBonus
  );

$('#bonusModal')
  .addEventListener(
    'click',
    e=>{
      if(
        e.target.id===
        'bonusModal'
      ){
        closeBonus();
      }
    }
  );


/* Reaction */

document
  .querySelector(
    '.reaction-row'
  )
  .addEventListener(
    'click',
    e=>{

      const b=
        e.target.closest(
          'button[data-reaction]'
        );

      if(b){
        react(
          b.dataset.reaction
        );
      }
    }
  );


/* Pointer trail */

addEventListener(
  'pointermove',
  e=>{

    if(
      e.pointerType==='mouse' ||
      e.pointerType==='touch' ||
      e.pointerType==='pen'
    ){

      const now=
        performance.now();

      const interval=
        mobile()
          ? 110
          : 85;

      if(
        now-lastTrailAt>
        interval
      ){

        lastTrailAt=now;

        makeTrail(
          e.clientX,
          e.clientY
        );
      }
    }

  },
  {passive:true}
);


/* Enter */

$('#enterBtn')
  .addEventListener(
    'click',
    ()=>{

      ensureAudio();

      $('#garden')
        .scrollIntoView({
          behavior:'smooth'
        });
    }
  );


/* Search */

$('#searchBtn')
  .addEventListener(
    'click',
    ()=>{

      searchWrap.hidden=
        !searchWrap.hidden;

      if(!searchWrap.hidden){
        searchInput.focus();
      }
    }
  );


searchInput
  .addEventListener(
    'input',
    ()=>{

      const q=
        searchInput.value
          .trim()
          .toLocaleLowerCase('vi');

      render(
        girls.filter(x=>
          x.name
            .toLocaleLowerCase('vi')
            .includes(q)
        )
      );
    }
  );


/* Teacher */

$('#teacherBtn')
  .addEventListener(
    'click',
    ()=>{

      if(busy)return;

      busy=true;

      lastScroll=
        scrollY;

      ensureAudio();

      openingSound();

      haptic(18);

      field.classList.add(
        'choosing'
      );

      const r=
        $('#teacherBtn')
          .getBoundingClientRect();

      burst(
        r.left+r.width/2,
        r.top+r.height/2
      );

      later(()=>{

        show(teacher);

        busy=false;

      },2050);
    }
  );


/* Close */

$('#closeLetter')
  .addEventListener(
    'click',
    closeLetter
  );


addEventListener(
  'keydown',
  e=>{

    if(e.key==='Escape'){

      closeReply();

      closeBonus();

      closeLetter();
    }
  }
);


/* Click outside letter */

letter.addEventListener(
  'click',
  e=>{

    if(e.target===letter){
      closeLetter();
    }
  }
);


/* Finale */

$('#finale')
  .addEventListener(
    'click',
    e=>{

      if(
        e.target.id===
        'finale'
      ){
        closeFinale();
      }
    }
  );


/* Resize */

addEventListener(
  'resize',
  ()=>{

    clearTimeout(
      window.__resize
    );

    window.__resize=
      setTimeout(()=>{

        ambientHearts();

        if(
          !letter.classList.contains(
            'open'
          )
        ){

          render(
            searchInput.value
              ? girls.filter(x=>
                  x.name
                    .toLocaleLowerCase('vi')
                    .includes(
                      searchInput.value
                        .trim()
                        .toLocaleLowerCase('vi')
                    )
                )
              : girls
          );
        }

      },180);
  }
);


/* =========================================================
   START
========================================================= */

ambientHearts();

render(girls);
```
