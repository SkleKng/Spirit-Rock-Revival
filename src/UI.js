import React, { useState, useEffect } from 'react';
import './UI.css'; // Ensure you have styles for the UI

function UI({ onColorChange }) { // Accept the callback prop from App.js
  const [selectedColor, setSelectedColor] = useState('red');

  // Map selected color to its hex code
  const colorMap = {
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      let color;
      switch (e.key) {
        case '1':
          color = 'red';
          break;
        case '2':
          color = 'green';
          break;
        case '3':
          color = 'blue';
          break;
        default:
          break;
      }
      if (color) {
        setSelectedColor(color);
        onColorChange(colorMap[color]); // Pass the hex code to App.js
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onColorChange]); // Include onColorChange in dependency array

  return (
    <div className="ui-container">
      <div className={`color-box red ${selectedColor === 'red' ? 'selected' : ''}`}>1</div>
      <div className={`color-box green ${selectedColor === 'green' ? 'selected' : ''}`}>2</div>
      <div className={`color-box blue ${selectedColor === 'blue' ? 'selected' : ''}`}>3</div>
    </div>
  );
}

export default UI;
