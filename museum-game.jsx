// ─── Game orchestrator: scene state machine + corridor + transition ─
const { useState, useEffect, useRef } = React;
// MUSEUM (data) and MUSEUM_ROOMS (room scenes) are top-level globals
// from museum-data.jsx and museum-rooms.jsx; PlayerSprite from museum-styles.jsx.

const STAGE_W = 1280, STAGE_H = 720;
const CORRIDOR_W = 3360;
const PORTAL_X = [480, 960, 1440, 1920, 2400, 2880]; // back-wall portal centers
const PORTAL_W = 180, PORTAL_H = 240;
const CORRIDOR_FLOOR_Y = 360;     // top of walking area
const CORRIDOR_FLOOR_BOTTOM = 696;
const PLAYER_SPEED = 230;         // px/sec
const PROXIMITY = 80;

const CORRIDOR_SPAWN = { x: 480, y: 560 };
const NEAR_PORTAL_RADIUS = 90;

// ─── Wikipedia thumbnail cache ────────────────────────────────
// Uses fixed Wikimedia Commons file URLs (most reliable) — see WIKI_FILES in data.
// Falls back to Wikipedia pageimages API for any missing entries.
const WIKI_CACHE = {};
function commonsThumbUrl(filename, width) {
  // Special:FilePath redirects to the actual upload URL, with optional width param.
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}
function fetchWikiImages(artworks, cb) {
  // artworks: array of {title, imgUrl?, wikiFile?, wikiTitle?}
  const out = {};
  const needApi = [];
  artworks.forEach(a => {
    if (a.title in WIKI_CACHE) {
      out[a.title] = WIKI_CACHE[a.title];
    } else if (a.imgUrl) {
      WIKI_CACHE[a.title] = a.imgUrl;
      out[a.title] = a.imgUrl;
    } else if (a.wikiFile) {
      const url = commonsThumbUrl(a.wikiFile, 720);
      WIKI_CACHE[a.title] = url;
      out[a.title] = url;
    } else if (a.wikiTitle) {
      needApi.push(a);
    } else {
      WIKI_CACHE[a.title] = null;
      out[a.title] = null;
    }
  });
  if (!needApi.length) { cb(out); return; }
  const qs = needApi.map(a => encodeURIComponent(a.wikiTitle)).join('|');
  fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${qs}&prop=pageimages&format=json&pithumbsize=720&origin=*`)
    .then(r => r.json())
    .then(data => {
      const norm = {};
      (data.query?.normalized || []).forEach(n => { norm[n.to] = n.from; });
      const titleToUrl = {};
      Object.values(data.query?.pages || {}).forEach(page => {
        const wikiT = norm[page.title] || page.title;
        titleToUrl[wikiT] = page.thumbnail?.source || null;
      });
      needApi.forEach(a => {
        const url = titleToUrl[a.wikiTitle] || null;
        WIKI_CACHE[a.title] = url;
        out[a.title] = url;
      });
      cb(out);
    })
    .catch(() => { needApi.forEach(a => { WIKI_CACHE[a.title] = null; out[a.title] = null; }); cb(out); });
}

// ─── Corridor scene ────────────────────────────────────────────
// Met-inspired: muted limestone-gray walls, polished travertine floor,
// dark wood benches, and ACTUAL famous paintings hung between portals.
//
// Positions where decorative paintings go (between adjacent portals).
// Each picks one signature artwork per era to advertise the room behind.
const DECO_SLOTS = [
  { x: 240,  era: 'imp', tilt: -1.2 },
  { x: 720,  era: 'cub', tilt:  0.8 },
  { x: 1200, era: 'sur', tilt: -0.6 },
  { x: 1680, era: 'abs', tilt:  1.1 },
  { x: 2160, era: 'pop', tilt: -0.4 },
  { x: 2640, era: 'con', tilt:  0.9 },
  { x: 3120, era: 'con2', tilt: -1.0 }, // bookend — second con piece
];

// Bench positions
const BENCH_X = [480, 960, 1440, 1920, 2400, 2880];

function DecoPainting({ x, art, imgSrc, tilt }) {
  // Larger, more dignified frames than before
  const fw = 116, fh = 86, fy = 46;
  const frameCol = '#1c1410';
  const matCol = '#1a1310';
  return (
    <div className="absolute" style={{
      left: x - fw/2, top: fy, width: fw, height: fh,
      transform: `rotate(${tilt}deg)`,
      transformOrigin: 'center top',
    }}>
      {/* outer wood frame */}
      <div style={{
        width:'100%', height:'100%',
        background: `linear-gradient(180deg, #2a1f18 0%, #1a1410 100%)`,
        padding: 5,
        boxShadow: '0 6px 18px rgba(20,14,10,0.5), 0 0 0 1px rgba(180,150,110,0.18)',
      }}>
        {/* inner mat */}
        <div style={{ width:'100%', height:'100%', background: matCol, padding: 2, position:'relative', overflow:'hidden' }}>
          {imgSrc
            ? <img src={imgSrc} alt={art?.title || ''} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            : <div className="absolute inset-0" style={{ background: art?.swatch || 'linear-gradient(135deg,#5a4a3a,#2a1f18)' }}/>
          }
        </div>
      </div>
      {/* hanging cord */}
      <div className="absolute" style={{ left:'50%', top:-14, width:1, height:14, background:'rgba(255,255,255,0.15)', transform:'translateX(-50%)' }}/>
      {/* picture light (small brass arm) */}
      <div className="absolute" style={{
        left:'50%', top:-6, width:fw*0.55, height:6, transform:'translateX(-50%)',
        background:'radial-gradient(ellipse at 50% 0%, rgba(255,230,180,0.45) 0%, transparent 70%)',
        pointerEvents:'none'
      }}/>
      {/* tiny placard */}
      <div className="absolute font-mono" style={{
        left:'50%', bottom:-14, transform:'translateX(-50%)',
        fontSize:7, letterSpacing:'0.18em', color:'rgba(80,72,64,0.9)', whiteSpace:'nowrap'
      }}>
        {art ? `${art.artistZh || art.artist} · ${art.year}` : ''}
      </div>
    </div>
  );
}

function CorridorBackdrop({ decoArts, decoImages }) {
  const wallH = CORRIDOR_FLOOR_Y - 8;
  return (
    <div className="absolute" style={{ left:0, top:0, width:CORRIDOR_W, height:STAGE_H }}>

      {/* ── ceiling shadow band ── */}
      <div className="absolute" style={{
        left:0, right:0, top:0, height:30,
        background:'linear-gradient(180deg, rgba(20,18,16,0.45) 0%, transparent 100%)',
        zIndex: 1, pointerEvents:'none'
      }}/>

      {/* ── back wall: cool limestone gray (Met-inspired) ── */}
      <div className="absolute" style={{
        left:0, right:0, top:0, height:wallH,
        background:`linear-gradient(180deg, #e6e2d8 0%, #d8d3c8 60%, #c4beb2 100%)`
      }}/>

      {/* ── subtle wall texture (like Met's stone walls) ── */}
      <div className="absolute" style={{
        left:0, right:0, top:0, height:wallH,
        backgroundImage:`
          repeating-linear-gradient(0deg, rgba(80,72,62,0.025) 0 2px, transparent 2px 7px),
          repeating-linear-gradient(90deg, rgba(80,72,62,0.02) 0 1px, transparent 1px 13px)`,
        opacity: 0.7, pointerEvents:'none'
      }}/>

      {/* ── recessed wall panels between paintings (subtle architecture) ── */}
      {DECO_SLOTS.map((slot, i) => (
        <div key={'panel'+i} className="absolute" style={{
          left: slot.x - 80, top: 30, width: 160, height: wallH - 50,
          border: '1px solid rgba(120,108,92,0.18)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 30%)',
          pointerEvents:'none'
        }}/>
      ))}

      {/* ── decorative paintings (real artwork) ── */}
      {DECO_SLOTS.map((slot, i) => {
        const art = decoArts[slot.era];
        const img = art ? decoImages[art.title] : null;
        return <DecoPainting key={'dp'+i} x={slot.x} art={art} imgSrc={img} tilt={slot.tilt}/>;
      })}

      {/* ── crown moulding: subtle gray-stone ── */}
      <div className="absolute" style={{
        left:0, right:0, top:0, height:18,
        background:'linear-gradient(180deg, #aaa295 0%, #8a8275 50%, #c4beb2 100%)',
        boxShadow:'0 2px 6px rgba(50,46,40,0.35)'
      }}/>
      <div className="absolute" style={{
        left:0, right:0, top:18, height:2, background:'rgba(50,46,40,0.4)'
      }}/>

      {/* ── chair rail (defines lower wall band) ── */}
      <div className="absolute" style={{
        left:0, right:0, top:wallH-32, height:3,
        background:'rgba(80,72,62,0.35)'
      }}/>

      {/* ── baseboard: deep walnut ── */}
      <div className="absolute" style={{
        left:0, right:0, top:wallH-12, height:14,
        background:'linear-gradient(180deg, #2c2520 0%, #1a1410 100%)',
        boxShadow:'0 3px 6px rgba(0,0,0,0.45)'
      }}/>

      {/* ── travertine floor: pale, polished ── */}
      <div className="absolute" style={{
        left:0, right:0, top:CORRIDOR_FLOOR_Y, bottom:0,
        background:`
          repeating-linear-gradient(90deg, rgba(120,108,92,0.06) 0 1px, transparent 1px 160px),
          repeating-linear-gradient(0deg,  rgba(120,108,92,0.04) 0 1px, transparent 1px 80px),
          radial-gradient(ellipse at 50% 0%, #e8e2d6 0%, #d4cdbc 60%, #b8b1a0 100%)`
      }}/>

      {/* floor specular reflection */}
      <div className="absolute" style={{
        left:0, right:0, top:CORRIDOR_FLOOR_Y, height:130,
        background:'linear-gradient(180deg, rgba(255,253,245,0.22) 0%, transparent 100%)',
        pointerEvents:'none'
      }}/>

      {/* portal floor reflections (warm ovals from each room's accent) */}
      {PORTAL_X.map((px, i) => (
        <div key={'rfl'+i} className="absolute" style={{
          left: px - 120, top: CORRIDOR_FLOOR_Y + 4, width: 240, height: 90,
          background:'radial-gradient(ellipse at 50% 0%, rgba(255,235,200,0.18) 0%, transparent 70%)',
          pointerEvents:'none'
        }}/>
      ))}

      {/* ── benches: sleek dark walnut, Met-style ── */}
      {BENCH_X.map((bx, i) => (
        <div key={'bench'+i} className="absolute" style={{ left: bx-90, top: CORRIDOR_FLOOR_Y+90, width:180, pointerEvents:'none' }}>
          {/* shadow */}
          <div style={{
            position:'absolute', left:6, top:40, width:168, height:8,
            background:'rgba(20,14,10,0.30)', borderRadius:'50%', filter:'blur(4px)'
          }}/>
          {/* slatted seat */}
          <div style={{
            position:'absolute', left:0, top:0, width:180, height:14,
            background:`linear-gradient(180deg, #3a2a1e 0%, #2a1d14 100%)`,
            borderRadius:2,
            boxShadow:'0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}/>
          {/* seat slats */}
          <div style={{
            position:'absolute', left:8, top:6, width:164, height:1,
            background:'rgba(140,110,80,0.18)',
          }}/>
          {/* end caps (block legs) */}
          <div style={{
            position:'absolute', left:6, top:13, width:14, height:30,
            background:'linear-gradient(180deg, #3a2a1e 0%, #1a1108 100%)',
            borderRadius:'0 0 1px 1px',
          }}/>
          <div style={{
            position:'absolute', right:6, top:13, width:14, height:30,
            background:'linear-gradient(180deg, #3a2a1e 0%, #1a1108 100%)',
            borderRadius:'0 0 1px 1px',
          }}/>
          {/* stretcher */}
          <div style={{
            position:'absolute', left:20, top:24, width:140, height:3,
            background:'#2a1d14', borderRadius:1,
          }}/>
        </div>
      ))}

      {/* ── recessed ceiling spotlights over portals ── */}
      {PORTAL_X.map((px, i) => (
        <div key={'spot'+i} className="absolute" style={{
          left:px-160, top:0, width:320, height:wallH,
          background:'radial-gradient(ellipse at 50% 0%, rgba(255,245,225,0.28) 0%, transparent 65%)',
          pointerEvents:'none'
        }}/>
      ))}
      {/* spotlights over decorative paintings */}
      {DECO_SLOTS.map((slot, i) => (
        <div key={'dspot'+i} className="absolute" style={{
          left: slot.x - 80, top: 0, width: 160, height: 200,
          background:'radial-gradient(ellipse at 50% 0%, rgba(255,240,210,0.32) 0%, transparent 70%)',
          pointerEvents:'none'
        }}/>
      ))}

    </div>
  );
}

function Portal({ room, x, hovered }) {
  const top = CORRIDOR_FLOOR_Y - PORTAL_H - 8;
  return (
    <div className="absolute select-none" style={{
      left: x - PORTAL_W/2, top, width: PORTAL_W, height: PORTAL_H+8,
      transition:'transform 240ms ease',
      transform: hovered ? 'translateY(-3px)' : 'none'
    }}>
      {/* arch frame */}
      <svg width={PORTAL_W} height={PORTAL_H+8} viewBox={`0 0 ${PORTAL_W} ${PORTAL_H+8}`} style={{ position:'absolute', inset:0 }}>
        <defs>
          <linearGradient id={`pg-${room.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1f1410"/>
            <stop offset="50%" stopColor="#3a2a1e"/>
            <stop offset="100%" stopColor="#1f0a08"/>
          </linearGradient>
          <linearGradient id={`pa-${room.id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={room.accent} stopOpacity="0.4"/>
            <stop offset="50%" stopColor={room.accent} stopOpacity="0.95"/>
            <stop offset="100%" stopColor={room.accent} stopOpacity="0.4"/>
          </linearGradient>
        </defs>
        {/* doorway dark interior */}
        <path d={`M 18,${PORTAL_H+8} L 18,90 Q 18,18 ${PORTAL_W/2},18 Q ${PORTAL_W-18},18 ${PORTAL_W-18},90 L ${PORTAL_W-18},${PORTAL_H+8} Z`} fill={`url(#pg-${room.id})`}/>
        {/* glow accent rim */}
        <path d={`M 18,${PORTAL_H+8} L 18,90 Q 18,18 ${PORTAL_W/2},18 Q ${PORTAL_W-18},18 ${PORTAL_W-18},90 L ${PORTAL_W-18},${PORTAL_H+8}`}
              fill="none" stroke={`url(#pa-${room.id})`} strokeWidth="3"/>
        {/* outer molding */}
        <path d={`M 6,${PORTAL_H+8} L 6,86 Q 6,6 ${PORTAL_W/2},6 Q ${PORTAL_W-6},6 ${PORTAL_W-6},86 L ${PORTAL_W-6},${PORTAL_H+8}`}
              fill="none" stroke="#8a5e3a" strokeWidth="3"/>
      </svg>
      {/* tone wash inside portal hinting at the room's palette */}
      <div className="absolute pointer-events-none" style={{
        left:24, top:96, right:24, bottom:24,
        background:`radial-gradient(ellipse at 50% 100%, ${room.accent}66 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0.7,
        transition:'opacity 240ms'
      }}/>
      {/* nameplate — engraved-stone aesthetic */}
      <div className="absolute" style={{
        left:'50%', top:PORTAL_H-14, transform:'translateX(-50%)',
        background:'#f5f2e9', border:'1px solid #2a2520', padding:'5px 16px',
        boxShadow:'0 5px 14px rgba(20,14,10,0.35)', whiteSpace:'nowrap'
      }}>
        <div className="font-display" style={{ fontSize:14, fontStyle:'italic', color:'#2a2520', lineHeight:1, letterSpacing:'0.02em' }}>{room.labelZh}</div>
        <div className="font-mono" style={{ fontSize:9, color:'#6a635a', textAlign:'center', marginTop:2, letterSpacing:'0.2em' }}>{room.year}</div>
      </div>
    </div>
  );
}

// ─── Room scene wrapper ───────────────────────────────────────
function RoomFrame({ room, art, hovered, imgSrc, onImgError }) {
  const { frame } = art._slot;
  return (
    <div className="absolute" style={{
      left: frame.x, top: frame.y, width: frame.w, height: frame.h,
      background:'#1f1410', padding: 4,
      boxShadow: hovered ? `0 0 0 3px ${room.accent}, 0 8px 18px rgba(0,0,0,0.5)` : '0 4px 8px rgba(0,0,0,0.45)',
      transition:'box-shadow 200ms'
    }}>
      <div style={{
        width:'100%', height:'100%',
        background: art.swatch || `linear-gradient(135deg, ${room.tone}, ${room.accent})`,
        position:'relative', overflow:'hidden'
      }}>
        {imgSrc
          ? <img src={imgSrc} alt={art.title} onError={onImgError} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
          : <div className="absolute inset-0" style={{ backgroundImage:`repeating-linear-gradient(45deg,rgba(255,255,255,0.04) 0 1px,transparent 1px 3px)`, mixBlendMode:'overlay' }}/>
        }
      </div>
    </div>
  );
}

function RoomIntroPanel({ room }) {
  return (
    <div className="absolute" style={{
      left: 18, top: 510, width: 212,
      borderLeft: `3px solid ${room.accent}`,
      background: 'rgba(14,9,6,0.70)',
      backdropFilter: 'blur(3px)',
      padding: '10px 13px',
      pointerEvents: 'none',
    }}>
      <div className="font-mono" style={{ fontSize:8, letterSpacing:'0.28em', color:room.accent, textTransform:'uppercase' }}>
        {room.year} · {room.sub}
      </div>
      <div className="font-display" style={{ fontSize:23, fontStyle:'italic', color:'#f4efe6', lineHeight:1.1, marginTop:4 }}>
        {room.labelZh}
      </div>
      <div style={{ height:1, background:'rgba(244,239,230,0.14)', margin:'7px 0' }}/>
      <div className="font-display" style={{ fontSize:10.5, color:'rgba(244,239,230,0.68)', lineHeight:1.65 }}>
        {room.why}
      </div>
    </div>
  );
}

function ExitDoor({ accent }) {
  const d = MUSEUM_ROOMS.ROOM_DOOR;
  return (
    <div className="absolute" style={{ left:d.x, top:d.y, width:d.w, height:d.h }}>
      <div className="absolute inset-0" style={{
        background:'linear-gradient(180deg, rgba(31,20,16,0.0) 0%, rgba(31,20,16,0.7) 60%, #1f1410 100%)'
      }}/>
      <div className="absolute" style={{
        left:0, right:0, top:0, height:4, background:accent
      }}/>
      <div className="absolute font-mono" style={{
        left:'50%', bottom:6, transform:'translateX(-50%)',
        fontSize:9, color:'#f4efe6', letterSpacing:'0.22em', whiteSpace:'nowrap'
      }}>
        ← TO HALL
      </div>
    </div>
  );
}

// ─── Stage scaler ─────────────────────────────────────────────
function useStageScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const el = ref.current?.parentElement; if (!el) return;
      const w = el.clientWidth, h = el.clientHeight;
      setScale(Math.min(w / STAGE_W, h / STAGE_H));
    };
    update();
    const ro = new ResizeObserver(update); if (ref.current?.parentElement) ro.observe(ref.current.parentElement);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  return [ref, scale];
}

// ─── HUD ──────────────────────────────────────────────────────
function HUD({ scene, room, prompt, visitedCount }) {
  const inCorridor = scene === 'corridor';
  return (
    <React.Fragment>
      {/* top-left location — only in corridor (rooms have RoomIntroPanel bottom-left) */}
      {inCorridor && (
        <div className="absolute" style={{ left:20, top:20, pointerEvents:'none' }}>
          <div style={{
            background:'rgba(248,246,242,0.96)', border:'1px solid #2a2520',
            padding:'8px 14px', boxShadow:'0 6px 16px rgba(31,20,16,0.25)'
          }}>
            <div className="font-mono" style={{ fontSize:9, letterSpacing:'0.22em', color:'#6a635a' }}>
              MUSÉE · 1874–1965
            </div>
            <div className="font-display" style={{ fontSize:18, fontStyle:'italic', color:'#2a2520', marginTop:2, lineHeight:1 }}>
              现代艺术长廊
            </div>
          </div>
        </div>
      )}
      {/* bottom-center prompt */}
      {prompt && (
        <div className="absolute" style={{ left:'50%', bottom:30, transform:'translateX(-50%)', pointerEvents:'none' }}>
          <div style={{
            background:'#3a2a1e', color:'#f4efe6',
            padding:'10px 18px', boxShadow:'0 8px 20px rgba(31,20,16,0.5)',
            display:'flex', alignItems:'center', gap:12
          }}>
            <span className="font-mono" style={{ fontSize:10, letterSpacing:'0.15em', background:'#f4efe6', color:'#3a2a1e', padding:'3px 8px' }}>{prompt.key}</span>
            <span className="font-display" style={{ fontSize:15, fontStyle:'italic' }}>{prompt.text}</span>
          </div>
        </div>
      )}
      {/* bottom-left controls hint */}
      <div className="absolute" style={{ left:20, bottom:20, pointerEvents:'none' }}>
        <div style={{
          background:'rgba(244,239,230,0.85)', border:'1px solid #5a3e26',
          padding:'6px 12px'
        }}>
          <div className="font-mono" style={{ fontSize:9, letterSpacing:'0.18em', color:'#5a3e26' }}>
            WASD MOVE · E INTERACT{scene !== 'corridor' ? ' · ESC EXIT' : ''}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

// ─── Aha transition overlay ───────────────────────────────────
function TransitionOverlay({ data }) {
  if (!data) return null;
  const { kind, room, t } = data; // t in 0..1
  // ease-in-out
  const ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
  // Two-phase: 0..0.5 wipe in, 0.5..1.0 wipe out
  const wipeIn = Math.min(1, t * 2);
  const wipeOut = Math.max(0, (t - 0.5) * 2);
  const radius = `${(wipeIn * 130).toFixed(1)}vmax`;
  const showLabel = t > 0.25 && t < 0.85;
  const labelOpacity = t < 0.5 ? (t - 0.25) * 4 : (0.85 - t) * 4 / 0.7;
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex:50 }}>
      {/* radial wipe */}
      <div className="absolute inset-0" style={{
        background: room.accent,
        clipPath: `circle(${radius} at 50% 50%)`,
        opacity: 1 - wipeOut * 0.95,
      }}/>
      {/* color flash */}
      <div className="absolute inset-0" style={{
        background:`radial-gradient(circle at 50% 50%, ${room.tone}cc 0%, ${room.accent}88 60%, transparent 100%)`,
        opacity: Math.max(0, 1 - Math.abs(t - 0.5) * 4)
      }}/>
      {/* label card */}
      {showLabel && (
        <div className="absolute" style={{
          left:'50%', top:'50%', transform:`translate(-50%,-50%) scale(${0.85 + ease*0.15})`,
          opacity: Math.max(0, Math.min(1, labelOpacity)),
          textAlign:'center', color:'#f4efe6'
        }}>
          <div className="font-mono" style={{ fontSize:11, letterSpacing:'0.4em', opacity:0.85 }}>
            {kind === 'enter' ? 'ENTERING' : 'RETURNING TO HALL'}
          </div>
          {kind === 'enter' && (
            <React.Fragment>
              <div className="font-display" style={{ fontSize:64, fontStyle:'italic', lineHeight:1.05, marginTop:14, textShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>
                {room.label}
              </div>
              <div className="font-display" style={{ fontSize:22, marginTop:6, opacity:0.92 }}>{room.labelZh} · {room.year}</div>
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Game root ────────────────────────────────────────────────
function Game() {
  const M = window.MUSEUM, MR = window.MUSEUM_ROOMS;
  const [scene, setScene] = useState('corridor');
  const [pos, setPos] = useState(CORRIDOR_SPAWN);
  const [facing, setFacing] = useState(1);
  const [walking, setWalking] = useState(false);
  const [transition, setTransition] = useState(null); // {kind, room, t0, dur, kind}
  const [transitionT, setTransitionT] = useState(0);
  const [modal, setModal] = useState(null);
  const [visited, setVisited] = useState({});
  const [roomImages, setRoomImages] = useState({});
  const [, force] = useState(0);

  // Refs for input loop
  const sceneRef = useRef(scene); useEffect(()=>{ sceneRef.current = scene; }, [scene]);
  const posRef = useRef(pos);     useEffect(()=>{ posRef.current = pos; }, [pos]);
  const transRef = useRef(transition); useEffect(()=>{ transRef.current = transition; }, [transition]);
  const modalRef = useRef(modal); useEffect(()=>{ modalRef.current = modal; }, [modal]);
  const keys = useRef({});

  // Slot lookup helper — attach _slot info to artworks
  const roomArtworks = (rid) => M.ARTWORKS.filter(a => a.roomId === rid).map((a,i) => ({...a, _slot: MR.PAINTING_SLOTS[a.slot]}));

  // Find nearby interactable
  const getInteract = () => {
    if (transRef.current || modalRef.current) return null;
    const p = posRef.current;
    if (sceneRef.current === 'corridor') {
      // nearest portal
      for (let i = 0; i < PORTAL_X.length; i++) {
        const dx = p.x - PORTAL_X[i], dy = p.y - 460;
        if (Math.abs(dx) < NEAR_PORTAL_RADIUS && p.y < 560) {
          return { type:'enter', room: M.ROOMS[i] };
        }
      }
      return null;
    } else {
      const rid = sceneRef.current;
      // nearest painting
      const arts = roomArtworks(rid);
      let best = null, bestD = Infinity;
      arts.forEach(a => {
        const s = MR.PAINTING_SLOTS[a.slot];
        const dx = p.x - s.stand.x, dy = p.y - s.stand.y;
        const d = Math.hypot(dx, dy);
        if (d < PROXIMITY && d < bestD) { best = a; bestD = d; }
      });
      if (best) return { type:'read', art: best };
      // exit door check
      const d = MR.ROOM_DOOR;
      if (p.x > d.x-30 && p.x < d.x+d.w+30 && p.y > d.y-40) return { type:'exit' };
      return null;
    }
  };

  // Trigger room enter
  const enterRoom = (room) => {
    const dur = 900;
    setTransition({ kind:'enter', room, t0: performance.now(), dur, target: room.id });
  };
  const exitRoom = () => {
    const rid = sceneRef.current;
    const room = M.ROOMS.find(r=>r.id===rid);
    setTransition({ kind:'exit', room, t0: performance.now(), dur: 700, target: 'corridor' });
  };

  // Main loop
  useEffect(() => {
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(48, now - last) / 1000; last = now;

      // Handle transition timing
      const tr = transRef.current;
      if (tr) {
        const t = Math.min(1, (now - tr.t0) / tr.dur);
        setTransitionT(t);
        if (t >= 1) {
          // commit scene swap
          if (tr.target === 'corridor') {
            const portalX = PORTAL_X[M.ROOMS.findIndex(r=>r.id===tr.room.id)] || CORRIDOR_SPAWN.x;
            setPos({ x: portalX, y: 540 });
            setScene('corridor');
          } else {
            setPos({ ...MR.ROOM_PLAYER_SPAWN });
            setScene(tr.target);
            setVisited(v => ({...v, [tr.target]: true}));
          }
          setTransition(null);
        }
      } else if (!modalRef.current) {
        // movement
        const k = keys.current;
        let dx = 0, dy = 0;
        if (k['arrowleft']  || k['a']) dx -= 1;
        if (k['arrowright'] || k['d']) dx += 1;
        if (k['arrowup']    || k['w']) dy -= 1;
        if (k['arrowdown']  || k['s']) dy += 1;
        if (dx || dy) {
          const len = Math.hypot(dx, dy) || 1;
          dx /= len; dy /= len;
          let nx = posRef.current.x + dx * PLAYER_SPEED * dt;
          let ny = posRef.current.y + dy * PLAYER_SPEED * dt;
          if (sceneRef.current === 'corridor') {
            nx = Math.max(40, Math.min(CORRIDOR_W - 40, nx));
            ny = Math.max(CORRIDOR_FLOOR_Y + 20, Math.min(CORRIDOR_FLOOR_BOTTOM - 24, ny));
          } else {
            nx = Math.max(36, Math.min(STAGE_W - 36, nx));
            ny = Math.max(126, Math.min(STAGE_H - 24, ny));
          }
          setPos({ x: nx, y: ny });
          if (dx !== 0) setFacing(dx > 0 ? 1 : -1);
          setWalking(true);
        } else {
          setWalking(false);
        }
      }
      force(v => (v + 1) % 1024); // re-render for prompts/animation
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard
  useEffect(() => {
    const dn = e => {
      const k = e.key.toLowerCase();
      keys.current[k] = true;
      if (k === 'e' || k === 'enter') {
        if (modalRef.current) { setModal(null); return; }
        const i = getInteract();
        if (i?.type === 'enter') enterRoom(i.room);
        else if (i?.type === 'read') setModal(i.art);
        else if (i?.type === 'exit') exitRoom();
      } else if (k === 'escape') {
        if (modalRef.current) setModal(null);
        else if (sceneRef.current !== 'corridor' && !transRef.current) exitRoom();
      }
    };
    const up = e => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  // Fetch Wikipedia images when entering a room
  useEffect(() => {
    if (scene === 'corridor') return;
    const arts = M.ARTWORKS.filter(a => a.roomId === scene);
    fetchWikiImages(arts, imgs => setRoomImages(prev => ({...prev, ...imgs})));
  }, [scene]);

  // Fetch corridor deco paintings (one signature per era) on mount
  const decoArts = React.useMemo(() => {
    // Pick one canonical artwork per era for corridor display (slot 0)
    const eras = ['imp','cub','sur','abs','pop','con'];
    const picks = {};
    eras.forEach(e => { picks[e] = M.ARTWORKS.find(a => a.roomId === e && a.slot === 0); });
    // con2: second conceptual piece (slot 1) for the bookend position
    picks['con2'] = M.ARTWORKS.find(a => a.roomId === 'con' && a.slot === 1);
    return picks;
  }, []);
  useEffect(() => {
    const arts = Object.values(decoArts).filter(Boolean);
    fetchWikiImages(arts, imgs => setRoomImages(prev => ({...prev, ...imgs})));
  }, []);

  // When an <img> fails to load (broken DB url), fall back to Wikipedia API via wikiTitle
  const handleImgError = (art) => {
    if (!art.wikiTitle) {
      WIKI_CACHE[art.title] = null;
      setRoomImages(prev => ({ ...prev, [art.title]: null }));
      return;
    }
    // Force re-fetch via API by clearing cache and constructing API-only artwork
    delete WIKI_CACHE[art.title];
    fetchWikiImages([{ title: art.title, wikiTitle: art.wikiTitle }],
      imgs => setRoomImages(prev => ({ ...prev, ...imgs })));
  };

  // Stage scale
  const [stageRef, scale] = useStageScale();

  // Derived
  const interact = getInteract();
  const inRoom = scene !== 'corridor';
  const room = inRoom ? M.ROOMS.find(r=>r.id===scene) : null;
  const visitedCount = Object.keys(visited).length;
  const arts = inRoom ? roomArtworks(scene) : [];
  const hoveredFrame = interact?.type === 'read' ? interact.art.slot : -1;
  const hoveredPortalIdx = interact?.type === 'enter' ? M.ROOMS.findIndex(r=>r.id===interact.room.id) : -1;

  // Camera (corridor only)
  const cameraX = !inRoom ? Math.max(0, Math.min(CORRIDOR_W - STAGE_W, pos.x - STAGE_W/2)) : 0;

  const promptObj = interact && !transition && !modal ? (
    interact.type === 'enter' ? { key:'E', text:`进入「${interact.room.labelZh}」` } :
    interact.type === 'read'  ? { key:'E', text:`阅读《${interact.art.titleZh || interact.art.title}》` } :
    interact.type === 'exit'  ? { key:'E', text:'返回长廊' } : null
  ) : null;

  const RoomScene = inRoom ? MR.SCENE_BY_ID[scene] : null;

  return (
    <div ref={stageRef} style={{
      width: STAGE_W, height: STAGE_H,
      transform: `scale(${scale})`, transformOrigin: 'center center',
      position:'relative', overflow:'hidden',
      background:'#1F1410',
      boxShadow:'0 30px 80px rgba(0,0,0,0.6)'
    }}>
      {/* ─── CORRIDOR SCENE ─── */}
      {!inRoom && (
        <div className="absolute" style={{ left:-cameraX, top:0, width:CORRIDOR_W, height:STAGE_H }}>
          <CorridorBackdrop decoArts={decoArts} decoImages={roomImages}/>
          {/* portals */}
          {M.ROOMS.map((r,i)=>(
            <Portal key={r.id} room={r} x={PORTAL_X[i]} hovered={hoveredPortalIdx === i}/>
          ))}
          {/* timeline floor markings */}
          {M.ROOMS.map((r,i)=>(
            <div key={'tl'+r.id} className="absolute font-mono" style={{
              left: PORTAL_X[i]-40, top: CORRIDOR_FLOOR_BOTTOM-30, width:80,
              fontSize:10, color:'#4a443c', textAlign:'center', letterSpacing:'0.22em', opacity:0.5
            }}>{r.year}</div>
          ))}
          {/* player */}
          <div className="absolute" style={{ left: pos.x-18, top: pos.y-46 }}>
            <window.PlayerSprite facing={facing} walking={walking}/>
          </div>
        </div>
      )}
      {/* ─── ROOM SCENE ─── */}
      {inRoom && (
        <div className="absolute inset-0">
          <RoomScene/>
          <RoomIntroPanel room={room}/>
          {arts.map(a => (
            <RoomFrame key={a.slot} room={room} art={a} hovered={hoveredFrame === a.slot} imgSrc={roomImages[a.title] || null} onImgError={() => handleImgError(a)}/>
          ))}
          {/* slot caption "why important" small label below frame */}
          {arts.map(a => {
            const isLeft  = a._slot.wall === 'left';
            const isRight = a._slot.wall === 'right';
            // for side walls, nudge caption inside the visible area
            const captionLeft = isRight ? a._slot.frame.x - 4 : a._slot.frame.x;
            const captionW    = a._slot.frame.w + (isLeft || isRight ? 4 : 0);
            return (
              <div key={'cap'+a.slot} className="absolute" style={{
                left: captionLeft,
                top: a._slot.frame.y + a._slot.frame.h + 4,
                width: captionW, textAlign:'center'
              }}>
                <div className="font-mono" style={{ fontSize:7, letterSpacing:'0.1em', color:'#3a2a1e', opacity:0.9, lineHeight:1.3, textTransform:'uppercase', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                  {a.titleZh || a.title}
                </div>
                <div className="font-mono" style={{ fontSize:6.5, letterSpacing:'0.08em', color:'#3a2a1e', opacity:0.6, lineHeight:1.2, textTransform:'uppercase', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                  {a.artist}
                </div>
              </div>
            );
          })}
          <ExitDoor accent={room.accent}/>
          {/* player */}
          <div className="absolute" style={{ left: pos.x-18, top: pos.y-46 }}>
            <window.PlayerSprite facing={facing} walking={walking}/>
          </div>
        </div>
      )}
      <HUD scene={scene} room={room} prompt={promptObj} visitedCount={visitedCount}/>
      <TransitionOverlay data={transition && { kind:transition.kind, room:transition.room, t:transitionT }}/>
      {/* modal */}
      {modal && (
        <window.ArtworkModal art={modal} room={room} imgSrc={roomImages[modal.title] || null} onClose={()=>setModal(null)}/>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('game-root')).render(<Game/>);
