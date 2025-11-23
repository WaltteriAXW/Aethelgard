import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

/**
 * MINIMAL PIXI TEST - Just draw a red rectangle
 * This verifies Pixi.js v8 is working at all
 */
export const GameCanvasMinimalTest = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log('[MINIMAL TEST] Starting...');
    console.log('[MINIMAL TEST] PIXI version:', PIXI.VERSION);

    const app = new PIXI.Application();

    app.init({
      width: 800,
      height: 600,
      background: 0x00ff00, // Bright green background
    }).then(() => {
      console.log('[MINIMAL TEST] App initialized');

      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
        console.log('[MINIMAL TEST] Canvas appended to DOM');
      }

      // Draw a simple red rectangle
      const graphics = new PIXI.Graphics();
      graphics.rect(100, 100, 200, 200).fill(0xff0000); // Red square
      app.stage.addChild(graphics);
      console.log('[MINIMAL TEST] Red rectangle added');

      // Draw a blue circle
      const circle = new PIXI.Graphics();
      circle.circle(400, 300, 100).fill(0x0000ff); // Blue circle
      app.stage.addChild(circle);
      console.log('[MINIMAL TEST] Blue circle added');

      console.log('[MINIMAL TEST] Stage children:', app.stage.children.length);
      console.log('[MINIMAL TEST] ✅ Complete!');
    }).catch(error => {
      console.error('[MINIMAL TEST] ❌ Initialization failed:', error);
    });

    return () => {
      if (app) {
        app.destroy(true);
      }
    };
  }, []);

  return (
    <div style={{
      padding: '20px',
      background: '#ffffff',
      color: '#000',
    }}>
      <h2>Pixi.js Minimal Test</h2>
      <p>If Pixi works, you'll see: GREEN background, RED square, BLUE circle</p>
      <div ref={canvasRef} style={{ border: '5px solid #000', marginTop: '10px' }} />
    </div>
  );
};
