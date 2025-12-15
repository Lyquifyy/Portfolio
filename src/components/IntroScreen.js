import React, { useEffect, useState } from 'react';

function IntroScreen({ onEnter }) {
  const [typedName, setTypedName] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const name = "Zander Erwin";
    let index = 0;

    const typingInterval = setInterval(() => {
      setTypedName(name.substring(0, index + 1));
      index++;

      if (index === name.length) {
        clearInterval(typingInterval);
      }
    }, 205);

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 700);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  const handleClick = () => {
    const introScreen = document.querySelector('.intro-screen');
    introScreen.classList.add('fade-out');

    setTimeout(() => {
      onEnter();
    }, 800);
  };

  return (
    <div
      className="intro-screen"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label="Click or press Enter to enter portfolio"
    >
      <h1>
        {typedName}
        <span style={{ opacity: showCursor ? 1 : 0 }} aria-hidden="true">|</span>
      </h1>
      <p>Click to Enter</p>
    </div>
  );
}

export default IntroScreen;
