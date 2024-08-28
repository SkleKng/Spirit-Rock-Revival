import React, { useState, useEffect } from 'react';
import './UI.css'; // Ensure you have styles for the UI

function UI() {
  const [selectedColor, setSelectedColor] = useState('red');

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case '1':
          setSelectedColor('red');
          break;
        case '2':
          setSelectedColor('green');
          break;
        case '3':
          setSelectedColor('blue');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="ui-container">
      <div className={`color-box red ${selectedColor === 'red' ? 'selected' : ''}`}>1</div>
      <div className={`color-box green ${selectedColor === 'green' ? 'selected' : ''}`}>2</div>
      <div className={`color-box blue ${selectedColor === 'blue' ? 'selected' : ''}`}>3</div>
    </div>
  );
}

export default UI;
