import { useEffect, useRef, useState, type CSSProperties } from 'react';

export type SylvaHeroVariant = 'living-green';

export type SylvaHeroProps = {
  bodyFont?: string;
  bodySize?: number;
  bodyWeight?: string;
  className?: string;
  headingFont?: string;
  headingLetterSpacing?: number;
  headingSize?: number;
  headingWeight?: string;
  primaryColor?: string;
  style?: CSSProperties;
  variant?: SylvaHeroVariant;
};

export function SylvaHero({
  bodyFont = 'lexend',
  bodySize = 16.5,
  bodyWeight = '300',
  className = '',
  headingFont = 'lexend',
  headingLetterSpacing = -0.006,
  headingSize = 63,
  headingWeight = '300',
  primaryColor = '#ffffff',
  style,
}: SylvaHeroProps): JSX.Element {
  const [ready, setReady] = useState(false);
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let isMounted = true;

    fetch('/landing-pages/inner-green-3d.html')
      .then((response) => response.text())
      .then((html) => {
        if (!isMounted) return;
        const shellStyle = `<style>
          .headline,
          .lede,
          .ghost {
            opacity: 0 !important;
            pointer-events: none !important;
          }
        </style>`;
        setSrcDoc(html.replace('<head>', `<head><base href="/landing-pages/">${shellStyle}`));
      })
      .catch(() => {
        if (isMounted) setSrcDoc(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    const document = frame?.contentDocument;
    if (!document) return;

    const customization = document.createElement('style');
    customization.textContent = `
      :root {
        --threeui-heading-font: ${headingFont};
        --threeui-body-font: ${bodyFont};
        --threeui-primary-color: ${primaryColor};
      }
      h1, .title, .hero-title {
        color: ${primaryColor} !important;
        font-family: ${headingFont}, Lexend, system-ui, sans-serif !important;
        font-size: clamp(2.45rem, ${headingSize / 14}vw, ${headingSize}px) !important;
        font-weight: ${headingWeight} !important;
        letter-spacing: ${headingLetterSpacing}em !important;
      }
      p, .copy, .hero-copy, .subtitle {
        color: rgba(255,255,255,0.82) !important;
        font-family: ${bodyFont}, Lexend, system-ui, sans-serif !important;
        font-size: ${bodySize}px !important;
        font-weight: ${bodyWeight} !important;
      }
    `;
    document.head.appendChild(customization);
  }, [
    bodyFont,
    bodySize,
    bodyWeight,
    headingFont,
    headingLetterSpacing,
    headingSize,
    headingWeight,
    primaryColor,
    ready,
  ]);

  return (
    <div
      className={`threeui-background landing-page-frame${className ? ` ${className}` : ''}`}
      data-state={ready ? 'ready' : 'loading'}
      style={{ position: 'relative', overflow: 'hidden', background: '#080808', ...style }}
    >
      <iframe
        ref={frameRef}
        title="Sylva - Into the living world"
        srcDoc={srcDoc ?? undefined}
        sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        loading="eager"
        onLoad={() => setReady(true)}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          display: 'block',
          width: '100vw',
          height: '100%',
          border: 0,
          background: '#080808',
          opacity: ready ? 1 : 0,
          transform: 'translateX(-50%)',
          transition: 'opacity 600ms ease',
        }}
      />
    </div>
  );
}
