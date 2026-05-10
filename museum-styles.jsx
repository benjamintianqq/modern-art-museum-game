// ─── Painterly room style overlays ──────────────────────────────
const ROOM_STYLES = {
  imp: {
    floor: `radial-gradient(ellipse 180px 90px at 30% 35%, #F0E2A8 0 18%, transparent 32%),
            radial-gradient(ellipse 220px 110px at 75% 70%, #C0D8B0 0 22%, transparent 36%),
            radial-gradient(ellipse 140px 70px at 55% 50%, #F4D8A0 0 15%, transparent 28%),
            linear-gradient(135deg, #C8D8B8 0%, #B5C7A0 50%, #A0B488 100%)`,
    wall:  `linear-gradient(180deg, #E8DCBC 0%, #D8C8A0 100%)`,
    light: `radial-gradient(ellipse at 50% 0%, rgba(255,238,180,0.35) 0%, transparent 60%)`,
  },
  cub: {
    floor: `conic-gradient(from 35deg at 30% 60%, #8a6a4a 0 25%, #b08660 25% 50%, #6a5238 50% 75%, #c4a07a 75%),
            linear-gradient(45deg, rgba(58,42,30,0.18) 0 50%, transparent 50%)`,
    wall:  `linear-gradient(60deg, #8A7660 0 33%, #6A5238 33% 66%, #C8B89A 66%)`,
    light: `linear-gradient(30deg, transparent 0 60%, rgba(58,42,30,0.25) 100%)`,
  },
  sur: {
    floor: `repeating-linear-gradient(45deg, #5A4A72 0 36px, #C8B4D4 36px 72px),
            radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(31,26,44,0.45) 100%)`,
    wall:  `linear-gradient(180deg, #1F1A2C 0%, #4A3A5C 50%, #7A5E8C 100%)`,
    light: `radial-gradient(circle at 50% 30%, rgba(232,214,173,0.25) 0%, transparent 50%)`,
  },
  abs: {
    floor: `radial-gradient(ellipse 80px 40px at 22% 30%, #C44A2A 0 60%, transparent 80%),
            radial-gradient(ellipse 60px 30px at 65% 55%, #1F1814 0 60%, transparent 80%),
            radial-gradient(ellipse 100px 50px at 75% 80%, #E8C25A 0 50%, transparent 75%),
            radial-gradient(ellipse 70px 35px at 35% 75%, #2A1818 0 60%, transparent 80%),
            linear-gradient(180deg, #3A2A1E 0%, #5A3A2A 100%)`,
    wall:  `linear-gradient(180deg, #2A1E18 0%, #5A3A2A 100%)`,
    light: `radial-gradient(circle at 50% 0%, rgba(255,200,140,0.18) 0%, transparent 70%)`,
  },
  pop: {
    floor: `radial-gradient(circle, #D8407A 3px, transparent 3.5px) 0 0/22px 22px,
            linear-gradient(180deg, #F4D04A 0%, #F8E078 100%)`,
    wall:  `linear-gradient(90deg, #D8407A 0 33%, #F4D04A 33% 66%, #3AC8E0 66%)`,
    light: `linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 40%)`,
  },
  con: {
    floor: `linear-gradient(rgba(58,42,30,0.06) 1px, transparent 1px) 0 0/64px 64px,
            linear-gradient(90deg, rgba(58,42,30,0.06) 1px, transparent 1px) 0 0/64px 64px,
            #F8F4EC`,
    wall:  `linear-gradient(180deg, #FAF6EE 0%, #F0EAE0 100%)`,
    light: `linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)`,
  },
};

// ─── Stardew-Valley-style character (cute female) ──────────────
function PlayerSprite({ facing, walking }) {
  const bob = walking ? `translateY(${Math.sin(Date.now() / 100) * 1.5}px)` : 'none';
  return (
    <div style={{
      width: 36, height: 52,
      transform: `${bob} ${facing < 0 ? 'scaleX(-1)' : ''}`,
      transformOrigin: '50% 100%',
      filter: 'drop-shadow(0 3px 3px rgba(30,20,15,0.4))',
    }}>
      <svg viewBox="0 0 36 52" width="36" height="52">
        {/* shadow */}
        <ellipse cx="18" cy="50" rx="10" ry="2.5" fill="rgba(30,20,15,0.22)"/>
        {/* legs */}
        <rect x="12" y="36" width="5" height="11" rx="2" fill="#2a3a5a"/>
        <rect x="19" y="36" width="5" height="11" rx="2" fill="#2a3a5a"/>
        {/* shoes */}
        <ellipse cx="14.5" cy="48" rx="3.5" ry="2" fill="#5a3a2a"/>
        <ellipse cx="21.5" cy="48" rx="3.5" ry="2" fill="#5a3a2a"/>
        {/* body — blue dress / tunic */}
        <path d="M10,22 Q10,19 13,19 L23,19 Q26,19 26,22 L27,38 Q27,40 24,40 L12,40 Q9,40 9,38 Z"
              fill="#4a7a9a"/>
        {/* dress details — belt */}
        <rect x="10" y="29" width="16" height="3" rx="1" fill="#3a6280"/>
        {/* collar */}
        <path d="M14,21 L18,24 L22,21" fill="none" stroke="#f0e8d8" strokeWidth="1.5" strokeLinecap="round"/>
        {/* arms */}
        <ellipse cx="9" cy="27" rx="3" ry="5.5" fill="#4a7a9a"/>
        <ellipse cx="27" cy="27" rx="3" ry="5.5" fill="#4a7a9a"/>
        {/* hands */}
        <circle cx="8.5" cy="32.5" r="2.3" fill="#f0cba8"/>
        <circle cx="27.5" cy="32.5" r="2.3" fill="#f0cba8"/>
        {/* neck */}
        <rect x="15.5" y="15.5" width="5" height="4" rx="1" fill="#f0cba8"/>
        {/* head */}
        <ellipse cx="18" cy="11" rx="7" ry="7.2" fill="#f0cba8"/>
        {/* hair — auburn with bangs */}
        <path d="M10.5,10 Q10,3 18,2.5 Q26,3 25.5,10 Q25,8 22,7 Q18,6 14,7 Q11,8 10.5,10 Z"
              fill="#8a3a22"/>
        {/* side hair (longer) */}
        <path d="M10.5,10 Q9,14 9.5,18 Q10,17 11,13 Z" fill="#8a3a22"/>
        <path d="M25.5,10 Q27,14 26.5,18 Q26,17 25,13 Z" fill="#8a3a22"/>
        {/* bangs */}
        <path d="M11,10 Q12,8.5 14,9.5 Q15,8 17,9 Q18,7.5 20,9 Q21.5,8 23,9.5 Q24.5,8.5 25,10"
              fill="#8a3a22" stroke="#7a3018" strokeWidth="0.3"/>
        {/* beret! */}
        <ellipse cx="18" cy="5" rx="8.5" ry="4" fill="#c44a3a"/>
        <ellipse cx="18" cy="5.5" rx="7" ry="2.8" fill="#d85a4a"/>
        <circle cx="18" cy="3" r="1.2" fill="#c44a3a"/>
        {/* eyes — big expressive */}
        <ellipse cx="15" cy="11.5" rx="1.2" ry="1.5" fill="#2a1a14"/>
        <ellipse cx="21" cy="11.5" rx="1.2" ry="1.5" fill="#2a1a14"/>
        {/* eye shine */}
        <circle cx="15.5" cy="11" r="0.5" fill="#fff" opacity="0.8"/>
        <circle cx="21.5" cy="11" r="0.5" fill="#fff" opacity="0.8"/>
        {/* cheek blush */}
        <circle cx="13" cy="13.5" r="1.5" fill="#e08a6a" opacity="0.45"/>
        <circle cx="23" cy="13.5" r="1.5" fill="#e08a6a" opacity="0.45"/>
        {/* mouth — small smile */}
        <path d="M16.5,14.8 Q18,15.8 19.5,14.8" stroke="#7a4a3a" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

window.ROOM_STYLES = ROOM_STYLES;
window.PlayerSprite = PlayerSprite;
