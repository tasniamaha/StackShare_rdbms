import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const loaderClassName = `loader loader-${size}`;

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={loaderClassName} />
      </div>
    );
  }

  return <div className={loaderClassName} />;
};

export default Loader;
