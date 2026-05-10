// ─── Artwork detail modal ─────────────────────────────────────
const { useEffect: useEffectModal } = React;

function MetaRow({ label, value }) {
  return (
    <div className="flex gap-2 py-1" style={{ borderBottom: '1px solid rgba(58,42,30,0.08)' }}>
      <dt className="font-mono text-[9px] tracking-[0.14em] uppercase shrink-0 w-[72px]" style={{ color: '#8C7E6E' }}>{label}</dt>
      <dd className="text-[11.5px] leading-snug" style={{ color: '#3A2A1E' }}>{value}</dd>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-wide font-mono"
          style={{ border: '1px solid rgba(58,42,30,0.25)', color: 'rgba(58,42,30,0.8)' }}>
      {children}
    </span>
  );
}

function ArtworkModal({ art, room, imgSrc, onClose }) {
  useEffectModal(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(30,20,14,0.55)',
        backdropFilter: 'blur(6px)',
        padding: 'clamp(8px, 2vw, 24px)',
        // Respect iOS safe areas
        paddingTop: 'max(env(safe-area-inset-top), clamp(8px, 2vw, 24px))',
        paddingBottom: 'max(env(safe-area-inset-bottom), clamp(8px, 2vw, 24px))',
      }}
      onClick={onClose}
    >
      <div
        className="artwork-modal-card relative w-full"
        style={{
          maxWidth: '1060px',
          background: '#F4EFE6',
          color: '#3A2A1E',
          animation: 'cardIn 320ms cubic-bezier(.2,.7,.2,1) both',
          maxHeight: 'min(92vh, 720px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* top bar */}
        <div className="flex items-center justify-between px-7 pt-5 pb-3"
             style={{ borderBottom: '1px solid rgba(58,42,30,0.12)' }}>
          <div className="flex items-center gap-4 font-mono text-[9.5px] tracking-[0.18em] uppercase"
               style={{ color: '#8C7E6E' }}>
            <span style={{ color: room.accent }}>● {room.labelZh} · {room.year}</span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-[9.5px] tracking-[0.18em] uppercase px-2.5 py-1 transition-colors"
            style={{
              border: '1px solid #3A2A1E',
              color: '#3A2A1E',
              background: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3A2A1E'; e.currentTarget.style.color = '#F4EFE6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3A2A1E'; }}
          >
            ESC
          </button>
        </div>

        {/* body — two columns on desktop, stacked on mobile */}
        <div className="modal-body grid grid-cols-12 gap-5 md:gap-7 pt-5 pb-6"
             style={{ paddingLeft: 'clamp(16px, 3vw, 28px)', paddingRight: 'clamp(16px, 3vw, 28px)' }}>
          {/* image column */}
          <div className="modal-image col-span-12 md:col-span-5">
            <div
              className="w-full relative"
              style={{
                aspectRatio: '4 / 3',
                background: imgSrc ? '#181210' : 'transparent',
                backgroundImage: imgSrc ? 'none' : (art.swatch + ', repeating-linear-gradient(135deg, rgba(58,42,30,0.05) 0 2px, transparent 2px 7px)'),
                border: '1px solid rgba(58,42,30,0.18)',
                overflow: 'hidden',
              }}
            >
              {imgSrc
                ? <img src={imgSrc} alt={art.title} style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }}/>
                : <div className="absolute top-2 left-2 px-1.5 py-0.5 font-mono text-[8.5px] tracking-[0.14em] uppercase"
                       style={{ background: 'rgba(244,239,230,0.7)', color: 'rgba(58,42,30,0.6)', border: '1px solid rgba(58,42,30,0.12)' }}>
                    {art.artist} · {art.year}
                  </div>
              }
            </div>
            <div className="flex items-center gap-2.5 mt-3">
              <span className="font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: '#8C7E6E' }}>Palette</span>
              <div className="flex">
                {art.palette.map((h, i) => <span key={i} className="w-5 h-5" style={{ background: h }} />)}
              </div>
              <div className="flex-1 h-px" style={{ background: 'rgba(58,42,30,0.12)' }} />
            </div>
            {/* metadata below image */}
            <dl className="mt-3" style={{ borderTop: '1px solid rgba(58,42,30,0.1)' }}>
              {art.medium     && <MetaRow label="Medium"     value={art.medium} />}
              {art.dimensions && <MetaRow label="Size" value={art.dimensions} />}
              {art.location   && <MetaRow label="Collection" value={art.location} />}
            </dl>
            {art.concepts && art.concepts.length > 0 && (
              <div className="mt-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {art.concepts.map((k) => <Pill key={k}>{k}</Pill>)}
                </div>
              </div>
            )}
          </div>

          {/* text column */}
          <div className="modal-text col-span-12 md:col-span-7">
            <div className="font-mono text-[9.5px] tracking-[0.18em] uppercase" style={{ color: room.accent }}>
              {art.artistZh}  ·  {art.year}
            </div>
            <h3 className="font-display text-[34px] leading-[1.05] mt-1.5" style={{ fontStyle: 'italic' }}>
              {art.title}
            </h3>
            <div className="font-display text-[17px] leading-tight mt-1" style={{ color: 'rgba(58,42,30,0.65)' }}>
              {art.titleZh}
            </div>

            <div style={{ height:1, background:'rgba(58,42,30,0.12)', margin:'10px 0' }}/>

            {/* rich description paragraphs */}
            <div className="space-y-2.5 text-[12.5px] leading-[1.72]" style={{ color: '#3A2A1E' }}>
              {art.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cardIn {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        /* Mobile: stack columns, shrink type, full-bleed card */
        @media (max-width: 767px) {
          .artwork-modal-card { max-height: 92vh !important; }
          .modal-image { order: 1; }
          .modal-text  { order: 2; }
        }
      `}</style>
    </div>
  );
}

window.ArtworkModal = ArtworkModal;
