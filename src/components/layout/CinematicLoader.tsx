"use client";

import { useEffect, useState } from "react";

export default function CinematicLoader() {
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.sessionStorage.getItem("portfolio-intro-seen")) { setVisible(false); return; }
    const reveal = window.setTimeout(() => { setLeaving(true); window.sessionStorage.setItem("portfolio-intro-seen", "1"); }, 2600);
    const remove = window.setTimeout(() => setVisible(false), 3300);
    return () => { window.clearTimeout(reveal); window.clearTimeout(remove); };
  }, []);

  if (!visible) return null;
  return <div className={`cinematic-loader ${leaving ? "is-leaving" : ""}`} role="status" aria-label="Loading portfolio">
    <div className="loader-stars" />
    <div className="loader-content">
      <p className="loader-eyebrow">JAYRAJ PRATAP SINGH / PORTFOLIO</p>
      <div className="loader-mark"><i /><i /><i /></div>
      <strong>INITIALIZING<br /><em>THE NEXUS</em></strong>
      <div className="loader-progress"><span /></div>
      <p className="loader-status">SYSTEMS ONLINE · ENTERING EXPERIENCE</p>
    </div>
  </div>;
}
