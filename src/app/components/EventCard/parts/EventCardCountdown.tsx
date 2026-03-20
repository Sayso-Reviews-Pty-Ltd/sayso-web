'use client';

interface EventCardCountdownProps {
  days: number;
  hours: number;
  minutes: number;
  show: boolean;
  status: 'upcoming' | 'live' | 'ended' | 'unknown';
}

const fontStyle = {
  fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
};

export function EventCardCountdown({
  days,
  hours,
  minutes,
  show,
  status,
}: EventCardCountdownProps) {
  if (!show) return null;

  const statusColors = {
    live: "bg-sage/95 text-white",
    ended: "bg-charcoal/85 text-white",
    unknown: "bg-off-white/95 text-charcoal/90",
    upcoming: "bg-off-white/95 text-charcoal/90",
  };

  return (
    <div
      className={`absolute left-3 bottom-3 z-20 inline-flex items-center gap-1.5 rounded-full backdrop-blur-md px-3 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.15)] ${statusColors[status]}`}
    >
      {status === "upcoming" && (
        <>
          {days > 0 && (
            <div className="flex items-baseline gap-0.5">
              <span
                className="text-xs font-bold leading-none"
                style={{ ...fontStyle, fontWeight: 700 }}
              >
                {days}
              </span>
              <span className="text-[10px] font-medium leading-none" style={fontStyle}>
                d
              </span>
            </div>
          )}
          {(days > 0 || hours > 0) && (
            <div className="flex items-baseline gap-0.5">
              <span
                className="text-xs font-bold leading-none"
                style={{ ...fontStyle, fontWeight: 700 }}
              >
                {hours}
              </span>
              <span className="text-[10px] font-medium leading-none" style={fontStyle}>
                h
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-0.5">
            <span
              className="text-xs font-bold leading-none"
              style={{ ...fontStyle, fontWeight: 700 }}
            >
              {minutes}
            </span>
            <span className="text-[10px] font-medium leading-none" style={fontStyle}>
              m
            </span>
          </div>
        </>
      )}

      {status === "live" && (
        <span className="text-xs font-semibold leading-none" style={fontStyle}>
          Live now
        </span>
      )}

      {status === "ended" && (
        <span className="text-xs font-semibold leading-none" style={fontStyle}>
          Ended
        </span>
      )}

      {status === "unknown" && (
        <span className="text-xs font-semibold leading-none" style={fontStyle}>
          Date TBA
        </span>
      )}
    </div>
  );
}
