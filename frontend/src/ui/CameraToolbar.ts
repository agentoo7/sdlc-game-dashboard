/**
 * CameraToolbar component for camera control buttons.
 * Story 6.2: Camera Controls Toolbar
 */

// Constants
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.2;
const DEFAULT_ZOOM = 1.0;
const CENTER_X = 400;
const CENTER_Y = 400;

// Keyboard shortcut mappings
const KEYBOARD_SHORTCUTS: Record<string, string> = {
  '+': 'zoomIn',
  '=': 'zoomIn',
  '-': 'zoomOut',
  '_': 'zoomOut',
  'p': 'togglePan',
  'P': 'togglePan',
  'c': 'center',
  'C': 'center',
  'Home': 'center',
  'r': 'reset',
  'R': 'reset',
  '0': 'reset',
};

export class CameraToolbar {
  private container: HTMLElement;
  private currentZoom: number = DEFAULT_ZOOM;
  private isPanModeEnabled: boolean = true; // Default: pan mode is enabled (existing behavior)
  private buttons: Map<string, HTMLButtonElement> = new Map();
  private keydownHandler: (event: KeyboardEvent) => void;
  private zoomChangedHandler: (event: Event) => void;
  private buttonClickHandlers: Map<string, () => void> = new Map();

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.container = container;

    this.keydownHandler = this.handleKeydown.bind(this);
    this.zoomChangedHandler = this.handleZoomChanged.bind(this) as EventListener;
    this.render();
    this.attachEventListeners();
  }

  private render(): void {
    this.container.className = 'camera-toolbar';
    this.container.innerHTML = `
      <button id="btn-zoom-in" class="camera-toolbar-btn" title="Zoom In (+/=)">
        <span>+</span>
      </button>
      <button id="btn-zoom-out" class="camera-toolbar-btn" title="Zoom Out (-/_)">
        <span>−</span>
      </button>
      <button id="btn-pan" class="camera-toolbar-btn active" title="Pan Mode (P)">
        <span>✥</span>
      </button>
      <button id="btn-center" class="camera-toolbar-btn" title="Center View (C/Home)">
        <span>⊙</span>
      </button>
      <button id="btn-reset" class="camera-toolbar-btn" title="Reset View (R/0)">
        <span>↺</span>
      </button>
    `;

    // Store button references
    this.buttons.set('zoomIn', this.container.querySelector('#btn-zoom-in') as HTMLButtonElement);
    this.buttons.set('zoomOut', this.container.querySelector('#btn-zoom-out') as HTMLButtonElement);
    this.buttons.set('pan', this.container.querySelector('#btn-pan') as HTMLButtonElement);
    this.buttons.set('center', this.container.querySelector('#btn-center') as HTMLButtonElement);
    this.buttons.set('reset', this.container.querySelector('#btn-reset') as HTMLButtonElement);

    // Update button states based on current zoom
    this.updateButtonStates();
  }

  private attachEventListeners(): void {
    // Button click handlers - store references for cleanup
    const zoomInHandler = () => this.zoomIn();
    const zoomOutHandler = () => this.zoomOut();
    const panHandler = () => this.togglePanMode();
    const centerHandler = () => this.centerView();
    const resetHandler = () => this.resetView();

    this.buttonClickHandlers.set('zoomIn', zoomInHandler);
    this.buttonClickHandlers.set('zoomOut', zoomOutHandler);
    this.buttonClickHandlers.set('pan', panHandler);
    this.buttonClickHandlers.set('center', centerHandler);
    this.buttonClickHandlers.set('reset', resetHandler);

    this.buttons.get('zoomIn')?.addEventListener('click', zoomInHandler);
    this.buttons.get('zoomOut')?.addEventListener('click', zoomOutHandler);
    this.buttons.get('pan')?.addEventListener('click', panHandler);
    this.buttons.get('center')?.addEventListener('click', centerHandler);
    this.buttons.get('reset')?.addEventListener('click', resetHandler);

    // Keyboard shortcuts
    document.addEventListener('keydown', this.keydownHandler);

    // Listen for zoom changes from MainScene
    window.addEventListener('zoomChanged', this.zoomChangedHandler);
  }

  private handleKeydown(event: KeyboardEvent): void {
    // Only handle if not typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const action = KEYBOARD_SHORTCUTS[event.key];
    if (!action) return;

    // Prevent default browser behavior for these keys
    event.preventDefault();

    switch (action) {
      case 'zoomIn':
        this.zoomIn();
        break;
      case 'zoomOut':
        this.zoomOut();
        break;
      case 'togglePan':
        this.togglePanMode();
        break;
      case 'center':
        this.centerView();
        break;
      case 'reset':
        this.resetView();
        break;
    }
  }

  private handleZoomChanged(event: CustomEvent<{ zoom: number }>): void {
    this.currentZoom = event.detail.zoom;
    this.updateButtonStates();
  }

  /** Zoom in by ZOOM_STEP (max ZOOM_MAX) */
  zoomIn(): void {
    if (this.currentZoom >= ZOOM_MAX) return;

    this.currentZoom = Math.min(this.currentZoom + ZOOM_STEP, ZOOM_MAX);
    // Round to avoid floating point issues
    this.currentZoom = Math.round(this.currentZoom * 10) / 10;

    this.emitZoomEvent();
    this.updateButtonStates();
  }

  /** Zoom out by ZOOM_STEP (min ZOOM_MIN) */
  zoomOut(): void {
    if (this.currentZoom <= ZOOM_MIN) return;

    this.currentZoom = Math.max(this.currentZoom - ZOOM_STEP, ZOOM_MIN);
    // Round to avoid floating point issues
    this.currentZoom = Math.round(this.currentZoom * 10) / 10;

    this.emitZoomEvent();
    this.updateButtonStates();
  }

  /** Toggle pan mode on/off */
  togglePanMode(): void {
    this.isPanModeEnabled = !this.isPanModeEnabled;

    const panButton = this.buttons.get('pan');
    if (panButton) {
      if (this.isPanModeEnabled) {
        panButton.classList.add('active');
      } else {
        panButton.classList.remove('active');
      }
    }

    window.dispatchEvent(new CustomEvent('cameraPanMode', {
      detail: { enabled: this.isPanModeEnabled }
    }));
  }

  /** Center the camera view */
  centerView(): void {
    window.dispatchEvent(new CustomEvent('cameraCenter', {
      detail: { x: CENTER_X, y: CENTER_Y }
    }));
  }

  /** Reset camera to default zoom and center position */
  resetView(): void {
    this.currentZoom = DEFAULT_ZOOM;
    this.updateButtonStates();

    window.dispatchEvent(new CustomEvent('cameraReset', {
      detail: { zoom: DEFAULT_ZOOM, x: CENTER_X, y: CENTER_Y }
    }));
  }

  private emitZoomEvent(): void {
    window.dispatchEvent(new CustomEvent('cameraZoom', {
      detail: { zoom: this.currentZoom }
    }));
  }

  private updateButtonStates(): void {
    const zoomInBtn = this.buttons.get('zoomIn');
    const zoomOutBtn = this.buttons.get('zoomOut');

    if (zoomInBtn) {
      zoomInBtn.disabled = this.currentZoom >= ZOOM_MAX;
    }
    if (zoomOutBtn) {
      zoomOutBtn.disabled = this.currentZoom <= ZOOM_MIN;
    }
  }

  /** Get current zoom level */
  getZoom(): number {
    return this.currentZoom;
  }

  /** Check if pan mode is enabled */
  getIsPanModeEnabled(): boolean {
    return this.isPanModeEnabled;
  }

  /** Set zoom level (used for syncing with MainScene) */
  setZoom(zoom: number): void {
    this.currentZoom = Math.round(zoom * 10) / 10;
    this.updateButtonStates();
  }

  /** Cleanup event listeners */
  destroy(): void {
    // Remove keyboard listener
    document.removeEventListener('keydown', this.keydownHandler);

    // Remove zoom changed listener
    window.removeEventListener('zoomChanged', this.zoomChangedHandler);

    // Remove button click listeners
    this.buttons.forEach((button, key) => {
      const handler = this.buttonClickHandlers.get(key);
      if (handler) {
        button.removeEventListener('click', handler);
      }
    });
    this.buttonClickHandlers.clear();
  }
}

// Export constants for testing
export { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, DEFAULT_ZOOM, CENTER_X, CENTER_Y, KEYBOARD_SHORTCUTS };
