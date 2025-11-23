/**
 * CameraEffects - Screen shake, zoom, and other camera effects
 */

export class CameraEffects {
  constructor() {
    this.shakeIntensity = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.flashIntensity = 0;
    this.flashColor = 0xffffff;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
  }

  /**
   * Add screen shake
   * @param {number} intensity - Shake intensity (0-1)
   */
  addShake(intensity) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  /**
   * Add screen flash
   * @param {number} intensity - Flash intensity (0-1)
   * @param {number} color - Flash color hex
   */
  addFlash(intensity, color = 0xffffff) {
    this.flashIntensity = Math.max(this.flashIntensity, intensity);
    this.flashColor = color;
  }

  /**
   * Set camera zoom
   */
  setZoom(zoom) {
    this.targetZoom = Math.max(0.5, Math.min(2.0, zoom));
  }

  /**
   * Update camera effects
   */
  update(dt) {
    // Update shake
    if (this.shakeIntensity > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 20;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 20;
      this.shakeIntensity *= Math.pow(0.1, dt); // Decay

      if (this.shakeIntensity < 0.01) {
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }

    // Update flash
    if (this.flashIntensity > 0) {
      this.flashIntensity *= Math.pow(0.05, dt); // Decay fast

      if (this.flashIntensity < 0.01) {
        this.flashIntensity = 0;
      }
    }

    // Update zoom
    this.zoom += (this.targetZoom - this.zoom) * dt * 5;
  }

  /**
   * Get shake offset
   */
  getShakeOffset() {
    return { x: this.shakeX, y: this.shakeY };
  }

  /**
   * Get flash data
   */
  getFlash() {
    return {
      intensity: this.flashIntensity,
      color: this.flashColor,
    };
  }

  /**
   * Get zoom level
   */
  getZoom() {
    return this.zoom;
  }

  /**
   * Reset all effects
   */
  reset() {
    this.shakeIntensity = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.flashIntensity = 0;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
  }
}
