// ─── Painting slot layout inside a 1280×720 room ─
// 10 frames: 6 on back wall, 2 on left wall, 2 on right wall.
const PAINTING_SLOTS = [
  // back wall (frames 96×72, y top edge 26)
  { wall:'back',  frame:{x:96,   y:26, w:96, h:72}, stand:{x:144,  y:200} },
  { wall:'back',  frame:{x:288,  y:26, w:96, h:72}, stand:{x:336,  y:200} },
  { wall:'back',  frame:{x:480,  y:26, w:96, h:72}, stand:{x:528,  y:200} },
  { wall:'back',  frame:{x:704,  y:26, w:96, h:72}, stand:{x:752,  y:200} },
  { wall:'back',  frame:{x:896,  y:26, w:96, h:72}, stand:{x:944,  y:200} },
  { wall:'back',  frame:{x:1088, y:26, w:96, h:72}, stand:{x:1136, y:200} },
  // left wall (frames 72×96)
  { wall:'left',  frame:{x:18,  y:228, w:72, h:96}, stand:{x:160,  y:276} },
  { wall:'left',  frame:{x:18,  y:402, w:72, h:96}, stand:{x:160,  y:450} },
  // right wall
  { wall:'right', frame:{x:1190, y:228, w:72, h:96}, stand:{x:1120, y:276} },
  { wall:'right', frame:{x:1190, y:402, w:72, h:96}, stand:{x:1120, y:450} },
];
const ROOM_DOOR = { x: 590, y: 656, w: 100, h: 60 };
const ROOM_PLAYER_SPAWN = { x: 640, y: 600 };

// ────────────────────────────────────────────────────────────────
// Per-room scenes — each room is a complete environment that
// transports you into the world of that art movement.
// ────────────────────────────────────────────────────────────────

// ═════════════════════════════════════════════════════════════════
// 1. IMPRESSIONISM — Monet's Giverny garden: water-lily pond at dusk
// ═════════════════════════════════════════════════════════════════
function ImpScene() {
  return (
    <React.Fragment>
      {/* sky reflected in water — soft pink/lavender dusk */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 600px 220px at 30% 20%, #f4d8c8 0%, transparent 50%),
          radial-gradient(ellipse 500px 200px at 70% 35%, #e8c8d8 0%, transparent 55%),
          linear-gradient(180deg, #d8e0d8 0%, #b8c8b8 30%, #6a8a7a 65%, #3d5a4a 100%)`
      }}/>
      {/* shimmering water highlights — Monet's signature dappled light */}
      <div className="absolute inset-0" style={{
        background:`
          radial-gradient(ellipse 220px 50px at 20% 60%, rgba(244,232,200,0.55) 0%, transparent 65%),
          radial-gradient(ellipse 280px 60px at 65% 50%, rgba(248,224,200,0.45) 0%, transparent 65%),
          radial-gradient(ellipse 180px 40px at 40% 75%, rgba(232,192,176,0.50) 0%, transparent 70%),
          radial-gradient(ellipse 220px 55px at 85% 70%, rgba(208,184,160,0.40) 0%, transparent 70%)`,
        mixBlendMode: 'screen'
      }}/>
      {/* horizon mist line */}
      <div className="absolute" style={{
        left:0, right:0, top:'58%', height:30,
        background:'linear-gradient(180deg, rgba(255,232,210,0.4) 0%, transparent 100%)',
        pointerEvents:'none'
      }}/>
      {/* willow branches drooping from top */}
      <svg className="absolute" style={{ left:0, top:120, width:340, height:300, opacity:0.55 }} viewBox="0 0 340 300">
        {[40,80,120,170,210,250,290].map((x,i)=>(
          <path key={i} d={`M ${x} 0 Q ${x-15} 100 ${x-30} 200 Q ${x-40} 280 ${x-55} 300`}
                stroke="#3a5a4a" strokeWidth="1.4" fill="none" opacity="0.7"/>
        ))}
        {[40,80,120,170,210,250,290].map((x,i)=>[...Array(8)].map((_,j)=>(
          <ellipse key={`l${i}${j}`} cx={x-(j*5)} cy={20+j*35} rx="2.5" ry="6" fill="#5a8a6a" opacity={0.4+j*0.05} transform={`rotate(${-15-j*2} ${x-(j*5)} ${20+j*35})`}/>
        )))}
      </svg>
      {/* willow on right side */}
      <svg className="absolute" style={{ right:0, top:140, width:300, height:280, opacity:0.5, transform:'scaleX(-1)' }} viewBox="0 0 300 280">
        {[40,80,140,200,260].map((x,i)=>(
          <path key={i} d={`M ${x} 0 Q ${x-10} 100 ${x-25} 200 Q ${x-35} 260 ${x-45} 280`}
                stroke="#3a5a4a" strokeWidth="1.3" fill="none"/>
        ))}
      </svg>
      {/* lily pads — circular, varied */}
      {[
        [12,68,76,40,18],[26,82,62,32,-10],[42,72,84,42,30],[56,60,68,38,-22],
        [72,86,72,40,12],[80,55,62,34,-30],[90,76,54,30,8],[14,90,48,26,-15],
        [50,92,70,36,22], [86,42,46,24,40], [22,46,40,20,-18], [38,82,58,30,5]
      ].map(([l,t,w,h,r],i)=>(
        <div key={i} className="absolute" style={{
          left:l+'%', top:t+'%', width:w, height:h,
          transform:`translate(-50%,-50%) rotate(${r}deg)`,
          background:'radial-gradient(ellipse at 55% 35%, #b8d0a0 0%, #6a8a4a 55%, #2d4a2a 100%)',
          borderRadius:'50%',
          boxShadow:'0 6px 18px rgba(20,40,30,0.5), inset -2px -3px 6px rgba(20,40,20,0.3)',
          opacity:0.94,
        }}/>
      ))}
      {/* lily pad notch (V cut into the side — characteristic shape) */}
      {[[26,82,40],[72,86,15],[14,90,-10],[50,92,28],[42,72,30]].map(([l,t,r],i)=>(
        <div key={'n'+i} className="absolute" style={{
          left:l+'%', top:t+'%', width:0, height:0,
          transform:`translate(-50%,-50%) rotate(${r}deg)`,
          borderTop:'18px solid #4a6e6a',
          borderLeft:'9px solid transparent',
          borderRight:'9px solid transparent',
          opacity:0.6,
        }}/>
      ))}
      {/* lily flowers — pink/white blooms */}
      {[[20,78,'#f4d8d0'],[44,72,'#f0c8d4'],[74,90,'#f8e0e8'],[88,76,'#e8c0d0'],[34,86,'#fce6dc'],[64,68,'#f4d0c8']].map(([l,t,c],i)=>(
        <div key={'f'+i} className="absolute" style={{
          left:l+'%', top:t+'%', width:24, height:24,
          transform:'translate(-50%,-50%)',
          background:`radial-gradient(circle, #fff 0 15%, ${c} 30% 55%, transparent 75%)`,
          borderRadius:'50%',
          boxShadow:`0 0 14px ${c}80`,
        }}/>
      ))}
      {/* the famous Japanese footbridge silhouette — far back */}
      <svg className="absolute" style={{ left:'30%', top:'48%', width:'40%', height:60, opacity:0.45 }} viewBox="0 0 400 60" preserveAspectRatio="none">
        <path d="M 0 50 Q 200 0 400 50 L 400 60 L 0 60 Z" fill="#3a5a4a"/>
        <path d="M 0 48 Q 200 -2 400 48" stroke="#5a7a5a" strokeWidth="2" fill="none"/>
      </svg>
      {/* back wall — pale Giverny garden trellis cream */}
      <div className="absolute" style={{ left:0, right:0, top:0, height:120, background:'linear-gradient(180deg, #f6ecd8 0%, #ead8b4 100%)' }}/>
      {/* trellis pattern */}
      <div className="absolute" style={{ left:0, right:0, top:0, height:120, opacity:0.18,
        backgroundImage:'repeating-linear-gradient(45deg, #6a4a2a 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, #6a4a2a 0 1px, transparent 1px 22px)' }}/>
      <div className="absolute" style={{ left:0, right:0, top:118, height:6, background:'linear-gradient(180deg,#9b7a4a,#6a4a2a)', boxShadow:'0 1px 0 #c8a070' }}/>
      {/* side walls */}
      <div className="absolute" style={{ left:0, top:0, bottom:0, width:14, background:'linear-gradient(90deg,#6a4a2a,#ead8b4)' }}/>
      <div className="absolute" style={{ right:0, top:0, bottom:0, width:14, background:'linear-gradient(270deg,#6a4a2a,#ead8b4)' }}/>
      {/* warm vignette */}
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 50% 30%, transparent 0%, transparent 50%, rgba(20,30,20,0.32) 100%)',
        pointerEvents:'none'
      }}/>
    </React.Fragment>
  );
}

// ═════════════════════════════════════════════════════════════════
// 2. CUBISM — Picasso's Bateau-Lavoir studio: shattered ochre planes
// ═════════════════════════════════════════════════════════════════
function CubScene() {
  return (
    <React.Fragment>
      {/* base earth-tone floor */}
      <div className="absolute inset-0" style={{
        background:'linear-gradient(180deg, #3a2d24 0%, #6a5238 100%)'
      }}/>
      {/* MASSIVE faceted shards covering everything */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 720" preserveAspectRatio="none">
        {/* big floor planes */}
        <polygon points="0,160 380,140 220,520 0,460" fill="#4a3829" opacity="0.95"/>
        <polygon points="380,140 720,180 540,440 220,520" fill="#a07a5a" opacity="0.85"/>
        <polygon points="720,180 980,150 1100,400 540,440" fill="#5a4233" opacity="0.92"/>
        <polygon points="980,150 1280,180 1280,560 1100,400" fill="#7a5e3e" opacity="0.88"/>
        <polygon points="0,460 220,520 540,440 1100,400 1280,560 1280,720 0,720" fill="#1f1814" opacity="0.7"/>
        {/* secondary smaller facets — newspaper textures */}
        <polygon points="100,400 200,380 180,500 80,500" fill="#c8b89a" opacity="0.35"/>
        <polygon points="600,380 720,360 700,460 600,480" fill="#d8c8a8" opacity="0.3"/>
        <polygon points="1000,420 1100,400 1090,500 990,520" fill="#c8b89a" opacity="0.35"/>
        {/* analytic cubist lines (Braque grid) */}
        <line x1="0" y1="280" x2="1280" y2="320" stroke="#e8d8b8" strokeWidth="1" opacity="0.25"/>
        <line x1="200" y1="0" x2="280" y2="720" stroke="#e8d8b8" strokeWidth="1" opacity="0.22"/>
        <line x1="600" y1="0" x2="720" y2="720" stroke="#e8d8b8" strokeWidth="1" opacity="0.22"/>
        <line x1="1000" y1="0" x2="1100" y2="720" stroke="#e8d8b8" strokeWidth="1" opacity="0.22"/>
      </svg>
      {/* fragmented guitar silhouette (collage element) — left foreground */}
      <svg className="absolute" style={{ left:'4%', bottom:'10%', width:240, height:280, opacity:0.55 }} viewBox="0 0 240 280">
        <polygon points="60,40 140,20 180,80 200,160 160,260 80,250 40,180 20,100" fill="#3a2d24" stroke="#c8b89a" strokeWidth="1.2" strokeDasharray="3,3"/>
        <circle cx="120" cy="150" r="32" fill="none" stroke="#c8b89a" strokeWidth="1.5"/>
        <circle cx="120" cy="150" r="22" fill="#1f1814" opacity="0.7"/>
        <line x1="120" y1="40" x2="120" y2="260" stroke="#c8b89a" strokeWidth="0.8" opacity="0.6"/>
        <line x1="115" y1="40" x2="115" y2="260" stroke="#c8b89a" strokeWidth="0.4" opacity="0.5"/>
        <line x1="125" y1="40" x2="125" y2="260" stroke="#c8b89a" strokeWidth="0.4" opacity="0.5"/>
      </svg>
      {/* newspaper headline collage — right side */}
      <div className="absolute font-mono" style={{
        right:'5%', bottom:'22%', width:160, transform:'rotate(-8deg)',
        background:'#e8d8b8', padding:'8px 10px', opacity:0.85,
        boxShadow:'0 6px 18px rgba(20,12,8,0.55)',
        borderTop:'2px solid #1f1814'
      }}>
        <div style={{ fontSize:8, letterSpacing:'0.18em', fontWeight:700, color:'#1f1814' }}>LE JOURNAL</div>
        <div style={{ height:1, background:'#1f1814', margin:'3px 0', opacity:0.5 }}/>
        <div style={{ fontSize:6.5, lineHeight:1.4, color:'#3a2d24' }}>NOUVEAU SALON · 1911<br/>Les Cubistes scandalisent<br/>la critique parisienne...</div>
      </div>
      {/* "JOU" letter fragment — Braque's collage signature */}
      <div className="absolute" style={{
        left:'68%', top:'48%', fontFamily:'Cormorant Garamond, serif', fontSize:54, fontWeight:700,
        color:'#e8d8b8', opacity:0.42, transform:'rotate(8deg)', letterSpacing:'0.05em'
      }}>JOU</div>
      {/* musical clef fragment — left middle */}
      <svg className="absolute" style={{ left:'18%', top:'42%', width:40, height:60, opacity:0.5 }} viewBox="0 0 40 60">
        <path d="M 20 5 Q 30 5 30 18 Q 30 30 18 32 Q 8 32 8 22 Q 8 14 18 14 Q 24 14 24 20 Q 24 24 20 24" stroke="#e8d8b8" strokeWidth="2" fill="none"/>
        <line x1="20" y1="5" x2="20" y2="55" stroke="#e8d8b8" strokeWidth="2"/>
      </svg>
      {/* back wall — multi-faceted ochre planes */}
      <div className="absolute" style={{ left:0, right:0, top:0, height:120,
        background:`linear-gradient(95deg, #d8c4a0 0 18%, #a07a5a 18% 38%, #c9a77e 38% 60%, #8a6a4a 60% 82%, #b89472 82%)` }}/>
      {/* wall facet overlay */}
      <svg className="absolute" style={{ left:0, top:0, width:'100%', height:120 }} viewBox="0 0 1280 120" preserveAspectRatio="none">
        <polygon points="0,0 280,0 220,120 0,120" fill="#1f1814" opacity="0.18"/>
        <polygon points="500,0 700,0 640,120 460,120" fill="#1f1814" opacity="0.12"/>
        <polygon points="900,0 1280,0 1280,120 940,120" fill="#1f1814" opacity="0.15"/>
      </svg>
      <div className="absolute" style={{ left:0, right:0, top:118, height:4, background:'#1f1814' }}/>
      <div className="absolute" style={{ left:0, top:0, bottom:0, width:14, background:'#3a2d24' }}/>
      <div className="absolute" style={{ right:0, top:0, bottom:0, width:14, background:'#3a2d24' }}/>
      {/* sharp directional spotlight (fractured studio light) */}
      <div className="absolute" style={{
        left:0, right:0, top:0, bottom:0,
        background:'linear-gradient(135deg, rgba(232,216,184,0.16) 0%, transparent 35%, rgba(20,12,8,0.4) 100%)',
        pointerEvents:'none'
      }}/>
    </React.Fragment>
  );
}

// ═════════════════════════════════════════════════════════════════
// 3. SURREALISM — Dalí's Catalan dreamscape: melting clocks, infinite plain
// ═════════════════════════════════════════════════════════════════
function SurScene() {
  return (
    <React.Fragment>
      {/* infinite Catalan plain → twilight sky gradient */}
      <div className="absolute inset-0" style={{
        background:`linear-gradient(180deg,
          #2a1d3a 0%, #4a3a5e 18%, #7a5e6c 32%,
          #c89878 48%, #e8b878 58%, #d49858 68%,
          #6a5878 80%, #2a3a55 100%)`
      }}/>
      {/* distant cliffs (Cap de Creus) */}
      <svg className="absolute" style={{ left:'5%', top:'52%', width:'90%', height:'12%' }} viewBox="0 0 1000 100" preserveAspectRatio="none">
        <polygon points="0,100 80,55 180,75 280,40 380,60 480,28 580,55 680,35 780,52 880,30 1000,48 1000,100" fill="#3a2a3a" opacity="0.8"/>
        <polygon points="0,100 80,75 180,85 280,65 380,80 480,55 580,75 680,60 780,72 880,55 1000,68 1000,100" fill="#5a4a5a" opacity="0.5"/>
      </svg>
      {/* horizon line */}
      <div className="absolute" style={{ left:0, right:0, top:'68%', height:2,
        background:'rgba(40,30,40,0.5)',
        boxShadow:'0 1px 0 rgba(255,235,180,0.3)' }}/>
      {/* very long shadows from invisible objects (signature surreal) */}
      <svg className="absolute" style={{ left:0, top:'68%', width:'100%', height:'30%', opacity:0.4 }} viewBox="0 0 1280 220" preserveAspectRatio="none">
        <polygon points="120,0 180,0 600,220 540,220" fill="#1f1a2c"/>
        <polygon points="780,0 830,0 1100,220 1060,220" fill="#1f1a2c"/>
        <polygon points="320,0 350,0 480,220 460,220" fill="#1f1a2c" opacity="0.7"/>
      </svg>
      {/* MELTING CLOCK — the iconic Dalí soft watch, draped over a pedestal */}
      <svg className="absolute" style={{ left:'6%', top:'56%', width:240, height:160 }} viewBox="0 0 240 160">
        {/* clock body — drooping ellipse */}
        <ellipse cx="80" cy="42" rx="62" ry="50" fill="#d8aa5a" stroke="#5a4233" strokeWidth="3"/>
        {/* dripping melted side */}
        <path d="M 58 80 Q 68 110 100 122 Q 144 132 192 112 Q 218 96 212 78 Q 200 70 178 76"
              fill="#d8aa5a" stroke="#5a4233" strokeWidth="3"/>
        {/* face details */}
        <circle cx="80" cy="42" r="58" fill="none" stroke="#3a2a1e" strokeWidth="0.5" opacity="0.6"/>
        {[0,3,6,9].map((h,i)=>(
          <text key={i} x={80+Math.cos((h*30-90)*Math.PI/180)*48} y={42+Math.sin((h*30-90)*Math.PI/180)*48+4}
                fontFamily="Cormorant Garamond" fontSize="10" textAnchor="middle" fill="#3a2a1e" fontStyle="italic">{['XII','III','VI','IX'][i]}</text>
        ))}
        <line x1="80" y1="42" x2="80" y2="14" stroke="#3a2a1e" strokeWidth="3" strokeLinecap="round"/>
        <line x1="80" y1="42" x2="104" y2="54" stroke="#3a2a1e" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="80" cy="42" r="3" fill="#3a2a1e"/>
        {/* ant on clock */}
        <ellipse cx="50" cy="55" rx="2.5" ry="1.5" fill="#1f1410"/>
        <ellipse cx="56" cy="58" rx="2.5" ry="1.5" fill="#1f1410"/>
      </svg>
      {/* second melting clock — hanging from invisible branch */}
      <svg className="absolute" style={{ right:'14%', top:'18%', width:120, height:130 }} viewBox="0 0 120 130">
        <ellipse cx="55" cy="35" rx="40" ry="32" fill="#5a4a3a" stroke="#1f1410" strokeWidth="2"/>
        <path d="M 25 60 Q 40 90 60 110 Q 75 122 85 110 Q 90 95 75 75" fill="#5a4a3a" stroke="#1f1410" strokeWidth="2"/>
        <line x1="55" y1="35" x2="55" y2="15" stroke="#1f1410" strokeWidth="2"/>
        <line x1="55" y1="35" x2="70" y2="42" stroke="#1f1410" strokeWidth="1.5"/>
      </svg>
      {/* a single dead tree branch — top right */}
      <svg className="absolute" style={{ right:0, top:0, width:280, height:240, opacity:0.7 }} viewBox="0 0 280 240">
        <path d="M 280 0 Q 240 60 200 100 Q 160 140 120 160 Q 80 175 40 180" stroke="#3a2a1e" strokeWidth="4" fill="none"/>
        <path d="M 200 100 Q 180 110 160 120" stroke="#3a2a1e" strokeWidth="2" fill="none"/>
        <path d="M 160 120 Q 140 130 130 145" stroke="#3a2a1e" strokeWidth="1.5" fill="none"/>
      </svg>
      {/* checkered tile floor (perspective-corrected, fading to horizon) */}
      <div className="absolute" style={{
        left:0, right:0, top:'68%', bottom:0,
        background:`repeating-conic-gradient(from 0deg at 50% 0%, rgba(58,42,30,0.4) 0 1deg, transparent 1deg 18deg)`,
        maskImage:'linear-gradient(180deg, transparent 0%, black 30%, black 100%)',
        WebkitMaskImage:'linear-gradient(180deg, transparent 0%, black 30%, black 100%)',
        opacity:0.4
      }}/>
      {/* floating eye in the sky */}
      <svg className="absolute" style={{ left:'48%', top:'12%', width:80, height:50 }} viewBox="0 0 80 50">
        <ellipse cx="40" cy="25" rx="34" ry="18" fill="#f4efe6" stroke="#3a2a1e" strokeWidth="1.5"/>
        <circle cx="40" cy="25" r="12" fill="#5a7e8c"/>
        <circle cx="40" cy="25" r="6" fill="#1f1410"/>
        <circle cx="42" cy="22" r="2" fill="#fff"/>
      </svg>
      {/* back wall — dream sky cream with twilight gradient */}
      <div className="absolute" style={{ left:0, right:0, top:0, height:120,
        background:'linear-gradient(180deg, #c8b8c8 0%, #d8b89a 50%, #c89878 100%)' }}/>
      <div className="absolute" style={{ left:0, right:0, top:118, height:4, background:'#3a2a3a' }}/>
      <div className="absolute" style={{ left:0, top:0, bottom:0, width:14, background:'#3a2a3a' }}/>
      <div className="absolute" style={{ right:0, top:0, bottom:0, width:14, background:'#3a2a3a' }}/>
    </React.Fragment>
  );
}

// ═════════════════════════════════════════════════════════════════
// 4. ABSTRACT EXPRESSIONISM — Pollock's studio floor + Rothko's chapel wall
// ═════════════════════════════════════════════════════════════════
function AbsScene() {
  return (
    <React.Fragment>
      {/* dark raw-canvas floor */}
      <div className="absolute inset-0" style={{
        background:'linear-gradient(180deg, #2a1815 0%, #1a0a08 100%)'
      }}/>
      {/* MASSIVE Pollock drip storm covering the floor */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 720" preserveAspectRatio="none">
        {/* large white blobs */}
        {[[120,260,28],[340,380,18],[580,300,32],[820,420,22],[1060,260,30],
          [260,540,16],[460,580,22],[920,580,26],[1140,460,18],[680,260,20],
          [200,650,14],[1200,650,16],[800,640,18]].map((d,i)=>(
          <circle key={'w'+i} cx={d[0]} cy={d[1]} r={d[2]} fill="#f4efe6" opacity="0.92"/>
        ))}
        {/* white drip tails — long flowing lines */}
        <path d="M 160 300 Q 240 360 200 460 Q 180 520 280 580 Q 360 620 320 700" stroke="#f4efe6" strokeWidth="4" fill="none" opacity="0.85"/>
        <path d="M 600 320 Q 720 380 680 480 Q 640 560 760 620" stroke="#f4efe6" strokeWidth="3.5" fill="none" opacity="0.8"/>
        <path d="M 1080 280 Q 1140 360 1080 440 Q 1020 520 1100 600" stroke="#f4efe6" strokeWidth="3" fill="none" opacity="0.85"/>
        <path d="M 380 400 Q 440 480 400 560 Q 360 620 460 680" stroke="#f4efe6" strokeWidth="2.5" fill="none" opacity="0.7"/>
        <path d="M 240 280 Q 280 340 320 380" stroke="#f4efe6" strokeWidth="2" fill="none" opacity="0.7"/>
        {/* gold splatters */}
        {[[200,400,22],[440,260,18],[700,540,24],[980,360,16],[1200,540,18],[80,500,14],[600,600,20]].map((d,i)=>(
          <circle key={'g'+i} cx={d[0]} cy={d[1]} r={d[2]} fill="#c9a24e" opacity="0.92"/>
        ))}
        {/* gold trails */}
        <path d="M 200 400 Q 280 460 240 560 Q 200 640 320 700" stroke="#c9a24e" strokeWidth="4" fill="none" opacity="0.75"/>
        <path d="M 980 360 Q 1040 440 1000 540 Q 960 620 1060 680" stroke="#c9a24e" strokeWidth="3.5" fill="none" opacity="0.75"/>
        <path d="M 440 260 Q 460 320 480 380 Q 500 440 460 500" stroke="#c9a24e" strokeWidth="2.5" fill="none" opacity="0.6"/>
        {/* dark red splashes */}
        {[[300,300,16],[760,260,22],[540,460,18],[860,520,20],[1100,400,14],[150,580,16],[920,300,16]].map((d,i)=>(
          <circle key={'r'+i} cx={d[0]} cy={d[1]} r={d[2]} fill="#a03a2a" opacity="0.88"/>
        ))}
        {/* red trails */}
        <path d="M 300 300 Q 340 360 380 420 Q 420 480 460 540" stroke="#a03a2a" strokeWidth="3" fill="none" opacity="0.7"/>
        <path d="M 760 260 Q 800 320 820 400" stroke="#a03a2a" strokeWidth="2.5" fill="none" opacity="0.7"/>
        {/* dark blue specs */}
        {[[400,420,12],[680,360,14],[100,520,10],[1180,300,12],[840,280,11],[520,560,13],
          [220,360,9],[1020,500,11],[640,640,12]].map((d,i)=>(
          <circle key={'b'+i} cx={d[0]} cy={d[1]} r={d[2]} fill="#3a4a6a" opacity="0.92"/>
        ))}
        {/* tiny black specks (cigarette ash, dirt — Pollock's actual studio) */}
        {[[160,440,3],[440,500,4],[760,360,3],[920,500,4],[1100,520,3],[280,620,4],
          [560,260,3],[820,640,4],[1000,300,3],[300,520,3],[700,420,4]].map((d,i)=>(
          <circle key={'k'+i} cx={d[0]} cy={d[1]} r={d[2]} fill="#1f1410" opacity="1"/>
        ))}
      </svg>
      {/* studio light pool — the harsh single bulb */}
      <div className="absolute" style={{
        left:'50%', top:0, width:600, height:400,
        transform:'translateX(-50%)',
        background:'radial-gradient(ellipse at 50% 0%, rgba(255,225,180,0.18) 0%, transparent 70%)',
        pointerEvents:'none'
      }}/>
      {/* back wall — Rothko-style horizontal color fields, blurred edges */}
      <div className="absolute" style={{ left:0, right:0, top:0, height:120,
        background:`linear-gradient(180deg,
          #c44a2a 0%, #c44a2a 35%,
          #2a0805 38%, #2a0805 60%,
          #d8623a 64%, #d8623a 100%)`,
        filter:'blur(0.5px)',
        boxShadow:'inset 0 0 30px rgba(20,8,5,0.6)'
      }}/>
      <div className="absolute" style={{ left:0, right:0, top:118, height:4, background:'#1f0a08' }}/>
      <div className="absolute" style={{ left:0, top:0, bottom:0, width:14, background:'#1f0a08' }}/>
      <div className="absolute" style={{ right:0, top:0, bottom:0, width:14, background:'#1f0a08' }}/>
      {/* deep vignette */}
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 50% 100%, transparent 30%, rgba(0,0,0,0.35) 100%)',
        pointerEvents:'none'
      }}/>
    </React.Fragment>
  );
}

// ═════════════════════════════════════════════════════════════════
// 5. POP ART — Warhol's Factory: Ben-Day dots, neon, supermarket hyper-color
// ═════════════════════════════════════════════════════════════════
function PopScene() {
  return (
    <React.Fragment>
      {/* split diagonal floor: pink × yellow with Ben-Day dots */}
      <div className="absolute inset-0" style={{
        background:`
          radial-gradient(circle, #1f1814 2.5px, transparent 3px) 0 0/22px 22px,
          linear-gradient(135deg, #f4d04a 0%, #f4d04a 50%, #d8407a 50%, #d8407a 100%)`
      }}/>
      {/* Lichtenstein speech bubble — WHAAM */}
      <svg className="absolute" style={{ left:'4%', bottom:'12%', width:260, height:140 }} viewBox="0 0 260 140">
        <ellipse cx="130" cy="65" rx="125" ry="58" fill="#f4efe6" stroke="#1f1814" strokeWidth="5"/>
        <polygon points="40,105 65,118 30,138" fill="#f4efe6" stroke="#1f1814" strokeWidth="5"/>
        <text x="130" y="80" textAnchor="middle" fontFamily="Manrope" fontWeight="900" fontSize="44" fill="#1f1814">WHAAM!</text>
      </svg>
      {/* POP! starburst */}
      <svg className="absolute" style={{ right:'4%', bottom:'10%', width:220, height:220, opacity:0.95 }} viewBox="0 0 220 220">
        <polygon points="110,10 128,75 195,60 142,110 195,160 128,145 110,210 92,145 25,160 78,110 25,60 92,75"
                fill="#3ac8e0" stroke="#1f1814" strokeWidth="5"/>
        <text x="110" y="125" textAnchor="middle" fontFamily="Manrope" fontWeight="900" fontSize="36" fill="#1f1814">POP!</text>
      </svg>
      {/* Soup can stack — center floor */}
      <svg className="absolute" style={{ left:'40%', top:'40%', width:140, height:200, opacity:0.9 }} viewBox="0 0 140 200">
        {[0,1,2].map(i => (
          <g key={i} transform={`translate(${i*8}, ${i*8})`}>
            <ellipse cx="50" cy="20" rx="42" ry="10" fill="#d8232a" stroke="#1f1814" strokeWidth="2"/>
            <rect x="8" y="20" width="84" height="80" fill="#d8232a" stroke="#1f1814" strokeWidth="2"/>
            <ellipse cx="50" cy="100" rx="42" ry="10" fill="#a01818" stroke="#1f1814" strokeWidth="2"/>
            <rect x="8" y="40" width="84" height="22" fill="#f4efe6"/>
            <text x="50" y="50" textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="11" fill="#d8232a" fontWeight="700">Campbell's</text>
            <text x="50" y="60" textAnchor="middle" fontFamily="Manrope" fontSize="6" fill="#1f1814" letterSpacing="0.1em">CONDENSED</text>
            <text x="50" y="76" textAnchor="middle" fontFamily="Manrope" fontWeight="900" fontSize="9" fill="#1f1814">TOMATO</text>
          </g>
        ))}
      </svg>
      {/* halftone dot diagonal accent */}
      <div className="absolute" style={{
        left:'70%', top:'30%', width:200, height:200,
        background:'radial-gradient(circle, #d8232a 4px, transparent 5px) 0 0/16px 16px',
        opacity:0.55,
        clipPath:'polygon(20% 0, 100% 0, 100% 80%, 60% 100%, 0% 100%, 0 40%)',
      }}/>
      {/* "BANG" comic burst, top-left */}
      <svg className="absolute" style={{ left:'14%', top:'18%', width:160, height:80, opacity:0.85, transform:'rotate(-6deg)' }} viewBox="0 0 160 80">
        <polygon points="0,40 25,20 40,30 60,5 75,30 100,15 110,40 135,25 145,50 160,40 145,55 130,75 110,60 85,70 70,55 45,75 30,55 15,65" fill="#f4d04a" stroke="#1f1814" strokeWidth="3"/>
        <text x="80" y="48" textAnchor="middle" fontFamily="Manrope" fontWeight="900" fontSize="22" fill="#1f1814">BANG!</text>
      </svg>
      {/* back wall — Warhol-Marilyn-style 4-color band */}
      <div className="absolute" style={{ left:0, right:0, top:0, height:120,
        background:`linear-gradient(90deg, #3ac8e0 0 25%, #f4d04a 25% 50%, #d8407a 50% 75%, #6cd44a 75%)`
      }}/>
      {/* halftone overlay on wall */}
      <div className="absolute" style={{ left:0, right:0, top:0, height:120, opacity:0.25,
        backgroundImage:'radial-gradient(circle, #1f1814 1.5px, transparent 2px)',
        backgroundSize:'10px 10px' }}/>
      <div className="absolute" style={{ left:0, right:0, top:118, height:4, background:'#1f1814' }}/>
      <div className="absolute" style={{ left:0, top:0, bottom:0, width:14, background:'#1f1814' }}/>
      <div className="absolute" style={{ right:0, top:0, bottom:0, width:14, background:'#1f1814' }}/>
    </React.Fragment>
  );
}

// ═════════════════════════════════════════════════════════════════
// 6. CONCEPTUAL — austere white cube gallery, manifestos on wall, neon text
// ═════════════════════════════════════════════════════════════════
function ConScene() {
  return (
    <React.Fragment>
      {/* clean concrete-polished floor */}
      <div className="absolute inset-0" style={{ background:'linear-gradient(180deg, #fafaf6 0%, #ece8de 100%)' }}/>
      {/* faint floor grid */}
      <div className="absolute inset-0" style={{
        backgroundImage:'linear-gradient(rgba(58,42,30,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(58,42,30,0.05) 1px, transparent 1px)',
        backgroundSize:'80px 80px'
      }}/>
      {/* subtle diagonal floor seams */}
      <div className="absolute inset-0" style={{
        backgroundImage:'repeating-linear-gradient(45deg, rgba(58,42,30,0.025) 0 1px, transparent 1px 240px)',
      }}/>
      {/* large LeWitt manifesto — left */}
      <div className="absolute" style={{ left:'7%', top:'24%', maxWidth:200 }}>
        <div style={{
          fontFamily:'Cormorant Garamond, serif', fontStyle:'italic', fontSize:18, lineHeight:1.35,
          color:'#3a2a1e'
        }}>
          "An idea becomes a machine that makes the art."
        </div>
        <div style={{ height:1, background:'#857C70', margin:'10px 0', width:50 }}/>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#857C70', letterSpacing:'0.16em' }}>
          SOL LEWITT · 1967
        </div>
      </div>
      {/* Kosuth manifesto — right */}
      <div className="absolute" style={{ right:'7%', top:'26%', maxWidth:200, textAlign:'right' }}>
        <div style={{
          fontFamily:'Cormorant Garamond, serif', fontStyle:'italic', fontSize:18, lineHeight:1.35,
          color:'#3a2a1e'
        }}>
          "Art is the definition of art."
        </div>
        <div style={{ height:1, background:'#857C70', margin:'10px 0 10px auto', width:50 }}/>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'#857C70', letterSpacing:'0.16em' }}>
          JOSEPH KOSUTH · 1969
        </div>
      </div>
      {/* central neon line — Holzer-style truism scroll */}
      <div className="absolute" style={{
        left:'50%', top:'52%', transform:'translateX(-50%)',
        background:'#1f1410', padding:'10px 24px',
        boxShadow:'0 0 30px rgba(220,80,200,0.4), 0 8px 20px rgba(0,0,0,0.5)',
        whiteSpace:'nowrap'
      }}>
        <div style={{
          fontFamily:'JetBrains Mono', fontSize:13, color:'#ff5cd0', letterSpacing:'0.32em',
          textShadow:'0 0 8px rgba(255,92,208,0.7)'
        }}>
          PROTECT ME FROM WHAT I WANT
        </div>
      </div>
      {/* tiny placard — bottom center */}
      <div className="absolute font-mono" style={{
        left:'50%', top:'62%', transform:'translateX(-50%)',
        fontSize:9, color:'#857C70', letterSpacing:'0.22em'
      }}>
        — JENNY HOLZER, TRUISMS, 1977–79
      </div>
      {/* OBJECT — IMAGE — DEFINITION trinity (Kosuth's One and Three Chairs reference) */}
      <div className="absolute" style={{
        left:'50%', top:'72%', transform:'translateX(-50%)',
        display:'flex', gap:24, alignItems:'center'
      }}>
        {['OBJECT','IMAGE','DEFINITION'].map((t,i) => (
          <React.Fragment key={t}>
            <div className="font-mono" style={{ fontSize:10, letterSpacing:'0.22em', color:'#3a2a1e', opacity:0.7 }}>{t}</div>
            {i < 2 && <div style={{ width:18, height:1, background:'#857C70' }}/>}
          </React.Fragment>
        ))}
      </div>
      {/* white cube hard shadows — corners */}
      <div className="absolute" style={{ left:0, top:0, width:60, height:'100%',
        background:'linear-gradient(90deg, rgba(0,0,0,0.06) 0%, transparent 100%)', pointerEvents:'none' }}/>
      <div className="absolute" style={{ right:0, top:0, width:60, height:'100%',
        background:'linear-gradient(270deg, rgba(0,0,0,0.06) 0%, transparent 100%)', pointerEvents:'none' }}/>
      {/* back wall — pure white cube, the gallery cliché */}
      <div className="absolute" style={{ left:0, right:0, top:0, height:120, background:'linear-gradient(180deg, #ffffff 0%, #f0eee6 100%)' }}/>
      <div className="absolute" style={{ left:0, right:0, top:118, height:1, background:'#857C70' }}/>
      <div className="absolute" style={{ left:0, top:0, bottom:0, width:8, background:'#e6e1d4' }}/>
      <div className="absolute" style={{ right:0, top:0, bottom:0, width:8, background:'#e6e1d4' }}/>
      {/* track lighting hint */}
      <div className="absolute" style={{ left:0, right:0, top:8, height:2, background:'#1f1410', opacity:0.4 }}/>
    </React.Fragment>
  );
}

const SCENE_BY_ID = { imp:ImpScene, cub:CubScene, sur:SurScene, abs:AbsScene, pop:PopScene, con:ConScene };
window.MUSEUM_ROOMS = { PAINTING_SLOTS, ROOM_DOOR, ROOM_PLAYER_SPAWN, SCENE_BY_ID };
