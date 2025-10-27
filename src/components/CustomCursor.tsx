import { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    
    const follower = document.createElement('div');
    follower.classList.add('custom-cursor-follower');
    
    document.body.appendChild(cursor);
    document.body.appendChild(follower);
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let followerX = 0;
    let followerY = 0;
    
    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const handleMouseEnter = () => {
      const hoverElements = document.querySelectorAll('button, a, input, textarea, select');
      hoverElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('hover');
          follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('hover');
          follower.classList.remove('hover');
        });
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    handleMouseEnter();
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cursor.remove();
      follower.remove();
    };
  }, []);
  
  return null;
}

