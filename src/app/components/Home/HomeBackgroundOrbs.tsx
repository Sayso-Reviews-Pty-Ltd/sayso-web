"use client";

// Premium floating orbs matching onboarding workflow
const floatingOrbsStyles = `
  /* Premium floating orbs */
  @keyframes float1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }

  @keyframes float2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, 40px) scale(0.95); }
    66% { transform: translate(25px, -25px) scale(1.05); }
  }

  @keyframes float3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(35px, 35px) scale(1.08); }
  }

  @keyframes float4 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-30px, -30px) scale(0.92); }
  }

  @keyframes float5 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(20px, -40px) scale(1.06); }
    75% { transform: translate(-25px, 30px) scale(0.94); }
  }

  .floating-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  .floating-orb-1 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(157, 171, 155, 0.6) 0%, rgba(157, 171, 155, 0.2) 50%, transparent 100%);
    top: 10%;
    left: 5%;
    animation: float1 20s ease-in-out infinite;
  }

  .floating-orb-2 {
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(125, 15, 42, 0.5) 0%, rgba(125, 15, 42, 0.2) 50%, transparent 100%);
    top: 60%;
    right: 8%;
    animation: float2 25s ease-in-out infinite;
  }

  .floating-orb-3 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(157, 171, 155, 0.45) 0%, rgba(157, 171, 155, 0.15) 50%, transparent 100%);
    bottom: 15%;
    left: 10%;
    animation: float3 18s ease-in-out infinite;
  }

  .floating-orb-4 {
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(125, 15, 42, 0.4) 0%, rgba(125, 15, 42, 0.15) 50%, transparent 100%);
    top: 30%;
    right: 15%;
    animation: float4 22s ease-in-out infinite;
  }

  .floating-orb-5 {
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(157, 171, 155, 0.5) 0%, rgba(157, 171, 155, 0.2) 50%, transparent 100%);
    bottom: 25%;
    right: 5%;
    animation: float5 24s ease-in-out infinite;
  }

  .floating-orb-6 {
    width: 160px;
    height: 160px;
    background: radial-gradient(circle, rgba(125, 15, 42, 0.35) 0%, rgba(125, 15, 42, 0.12) 50%, transparent 100%);
    top: 50%;
    left: 2%;
    animation: float1 19s ease-in-out infinite reverse;
  }

  @media (max-width: 768px) {
    .floating-orb {
      filter: blur(40px);
      opacity: 0.3;
    }
    .floating-orb-1 { width: 200px; height: 200px; }
    .floating-orb-2 { width: 180px; height: 180px; }
    .floating-orb-3 { width: 150px; height: 150px; }
    .floating-orb-4 { width: 140px; height: 140px; }
    .floating-orb-5 { width: 160px; height: 160px; }
    .floating-orb-6 { width: 120px; height: 120px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .floating-orb { animation: none !important; opacity: 0.2 !important; }
  }
`;

export default function HomeBackgroundOrbs() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: floatingOrbsStyles }} />
      {/* Premium floating orbs background */}
      <div className="floating-orb floating-orb-1" aria-hidden="true" />
      <div className="floating-orb floating-orb-2" aria-hidden="true" />
      <div className="floating-orb floating-orb-3" aria-hidden="true" />
      <div className="floating-orb floating-orb-4" aria-hidden="true" />
      <div className="floating-orb floating-orb-5" aria-hidden="true" />
      <div className="floating-orb floating-orb-6" aria-hidden="true" />
    </>
  );
}
