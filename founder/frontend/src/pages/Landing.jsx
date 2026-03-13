import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Landing() {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'founder';
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (phase === 0) {
      let i = 0;
      const t = setInterval(() => {
        i++;
        setDisplayText(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(t);
          setPhase(1);
        }
      }, 120);
      return () => clearInterval(t);
    }
  }, [phase]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-purple-50/50 to-white">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl md:text-6xl font-extrabold text-founder-purple font-logo mb-4 min-h-[1.2em]">
          {displayText}
          {phase === 1 && <span className="animate-blink">.</span>}
        </h1>
        <p className="text-xl text-gray-600 mb-10 opacity-0 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
          build technical connections
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
          <Link
            to="/become-founder"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-founder-purple to-founder-purpleLight text-white font-semibold hover:shadow-lg hover:shadow-founder-purple/30 transition-all"
          >
            Become a founder.
          </Link>
          <Link
            to="/auth"
            className="px-8 py-4 rounded-xl border-2 border-founder-purple text-founder-purple font-semibold hover:bg-founder-purple/5 transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
