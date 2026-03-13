import React, { useEffect, useRef } from "react";
import styles from "../styles/sections/animated-distorted-text.less";

export function Component({ props }) {
  const turbulenceRef = useRef(null);
  const { line_1, line_2 } = props || {};
  const textLine1 = line_1?.value ?? "WE DON'T JUST MAKE HERE";
  const textLine2 = line_2?.value ?? "WE ENGINEER PERFORMANCE";

  useEffect(() => {
    const turbulence = turbulenceRef.current;
    if (!turbulence) return;

    let freqX = 0.002;
    const freqY = 0.09;
    let direction = 1;
    let rafId;

    function animateDistortion() {
      freqX += 0.00002 * direction;
      if (freqX > 0.003 || freqX < 0.0015) {
        direction *= -1;
      }
      turbulence.setAttribute("baseFrequency", `${freqX} ${freqY}`);
      rafId = requestAnimationFrame(animateDistortion);
    }

    animateDistortion();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section className={styles.animatedDistortedTextSection}>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap"
        rel="stylesheet"
      />
      <div className={styles.wrapper}>
        <div className={styles.distortedText}>
          {textLine1}
          <br />
          {textLine2}
        </div>
      </div>
      <svg width="0" height="0" aria-hidden="true">
        <filter id="waveDistortion">
          <feTurbulence
            ref={turbulenceRef}
            id="turbulence"
            type="turbulence"
            baseFrequency="0.002 0.09"
            numOctaves="2"
            result="turbulence"
            seed="2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </section>
  );
}

export default Component;
