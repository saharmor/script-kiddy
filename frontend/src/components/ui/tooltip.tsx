import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ 
  children, 
  content, 
  position = 'top', 
  delay = 300 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const showTooltip = () => {
    setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };
  
  const hideTooltip = () => {
    setIsVisible(false);
  };
  
  useEffect(() => {
    if (isVisible && childRef.current && tooltipRef.current) {
      const childRect = childRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;
      
      switch (position) {
        case 'top':
          x = childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
          y = childRect.top - tooltipRect.height - 5;
          break;
        case 'bottom':
          x = childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
          y = childRect.bottom + 5;
          break;
        case 'left':
          x = childRect.left - tooltipRect.width - 5;
          y = childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
          break;
        case 'right':
          x = childRect.right + 5;
          y = childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
          break;
      }
      
      // Adjust for scroll
      x += window.scrollX;
      y += window.scrollY;
      
      setCoords({ x, y });
    }
  }, [isVisible, position]);
  
  return (
    <>
      <div 
        ref={childRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {content}
          <div
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              transform: 'rotate(45deg)',
              ...(position === 'top' ? { bottom: '-4px', left: 'calc(50% - 4px)' } :
                 position === 'bottom' ? { top: '-4px', left: 'calc(50% - 4px)' } :
                 position === 'left' ? { right: '-4px', top: 'calc(50% - 4px)' } :
                 { left: '-4px', top: 'calc(50% - 4px)' })
            }}
          />
        </div>
      )}
    </>
  );
}
