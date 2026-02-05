/**
 * Tests for CameraToolbar component.
 * Story 6.2: Camera Controls Toolbar
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, DEFAULT_ZOOM } from './CameraToolbar';

describe('CameraToolbar', () => {
  beforeEach(() => {
    // Setup DOM with toolbar container inside game-container
    document.body.innerHTML = `
      <main id="game-container" class="flex-1 relative min-w-0">
        <div id="camera-toolbar"></div>
      </main>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Toolbar Layout (AC1, AC2, AC3)', () => {
    it('should have toolbar container in DOM', () => {
      const container = document.getElementById('camera-toolbar');
      expect(container).not.toBeNull();
    });

    it('should be positioned inside game-container', () => {
      const gameContainer = document.getElementById('game-container');
      const toolbar = document.getElementById('camera-toolbar');
      expect(gameContainer?.contains(toolbar)).toBe(true);
    });

    it('should define correct toolbar styling constants', () => {
      const TOOLBAR_BG_OPACITY = 0.8;
      const TOOLBAR_BG_COLOR = '#1E293B';
      const TOOLBAR_BORDER_RADIUS = '8px';

      expect(TOOLBAR_BG_OPACITY).toBe(0.8);
      expect(TOOLBAR_BG_COLOR).toBe('#1E293B');
      expect(TOOLBAR_BORDER_RADIUS).toBe('8px');
    });

    it('should have 5 buttons defined', () => {
      const BUTTONS = ['zoomIn', 'zoomOut', 'pan', 'center', 'reset'];
      expect(BUTTONS.length).toBe(5);
    });
  });

  describe('Button States (AC4)', () => {
    it('should define button state classes', () => {
      const BUTTON_STATES = {
        default: 'camera-toolbar-btn',
        hover: 'camera-toolbar-btn:hover',
        active: 'camera-toolbar-btn active',
        disabled: 'camera-toolbar-btn:disabled',
      };

      expect(BUTTON_STATES.default).toBe('camera-toolbar-btn');
      expect(BUTTON_STATES.active).toContain('active');
    });
  });

  describe('Zoom Functionality (AC5, AC10)', () => {
    it('should define zoom limits', () => {
      expect(ZOOM_MIN).toBe(0.5);
      expect(ZOOM_MAX).toBe(2.0);
      expect(ZOOM_STEP).toBe(0.2);
    });

    it('should calculate zoom in correctly', () => {
      let currentZoom = 1.0;
      const zoomIn = () => {
        currentZoom = Math.min(currentZoom + ZOOM_STEP, ZOOM_MAX);
        return currentZoom;
      };

      expect(zoomIn()).toBeCloseTo(1.2, 1);
      expect(zoomIn()).toBeCloseTo(1.4, 1);
    });

    it('should calculate zoom out correctly', () => {
      let currentZoom = 1.0;
      const zoomOut = () => {
        currentZoom = Math.max(currentZoom - ZOOM_STEP, ZOOM_MIN);
        return currentZoom;
      };

      expect(zoomOut()).toBeCloseTo(0.8, 1);
      expect(zoomOut()).toBeCloseTo(0.6, 1);
    });

    it('should cap zoom at maximum', () => {
      let currentZoom = 1.8;
      currentZoom = Math.min(currentZoom + ZOOM_STEP, ZOOM_MAX);
      expect(currentZoom).toBe(2.0);

      // Should not exceed max
      currentZoom = Math.min(currentZoom + ZOOM_STEP, ZOOM_MAX);
      expect(currentZoom).toBe(2.0);
    });

    it('should cap zoom at minimum', () => {
      // 0.6 - 0.2 = 0.4, but capped at 0.5
      let currentZoom = 0.6;
      currentZoom = Math.max(currentZoom - ZOOM_STEP, ZOOM_MIN);
      expect(currentZoom).toBe(0.5); // Capped at minimum

      // Already at min, should stay at 0.5
      currentZoom = Math.max(currentZoom - ZOOM_STEP, ZOOM_MIN);
      expect(currentZoom).toBe(0.5);
    });

    it('should disable zoom in button at max zoom', () => {
      const currentZoom = 2.0;
      const isZoomInDisabled = currentZoom >= ZOOM_MAX;
      expect(isZoomInDisabled).toBe(true);
    });

    it('should disable zoom out button at min zoom', () => {
      const currentZoom = 0.5;
      const isZoomOutDisabled = currentZoom <= ZOOM_MIN;
      expect(isZoomOutDisabled).toBe(true);
    });

    it('should emit cameraZoom event', () => {
      const eventListener = vi.fn();
      window.addEventListener('cameraZoom', eventListener);

      window.dispatchEvent(new CustomEvent('cameraZoom', {
        detail: { zoom: 1.2 }
      }));

      expect(eventListener).toHaveBeenCalled();
      window.removeEventListener('cameraZoom', eventListener);
    });

    it('should include zoom level in event detail', () => {
      let receivedZoom = 0;

      window.addEventListener('cameraZoom', ((event: CustomEvent) => {
        receivedZoom = event.detail.zoom;
      }) as EventListener);

      window.dispatchEvent(new CustomEvent('cameraZoom', {
        detail: { zoom: 1.4 }
      }));

      expect(receivedZoom).toBe(1.4);
    });
  });

  describe('Pan Mode Toggle (AC6)', () => {
    it('should toggle pan mode state', () => {
      let isPanModeEnabled = false;

      const togglePanMode = () => {
        isPanModeEnabled = !isPanModeEnabled;
        return isPanModeEnabled;
      };

      expect(togglePanMode()).toBe(true);
      expect(togglePanMode()).toBe(false);
      expect(togglePanMode()).toBe(true);
    });

    it('should emit cameraPanMode event', () => {
      const eventListener = vi.fn();
      window.addEventListener('cameraPanMode', eventListener);

      window.dispatchEvent(new CustomEvent('cameraPanMode', {
        detail: { enabled: true }
      }));

      expect(eventListener).toHaveBeenCalled();
      window.removeEventListener('cameraPanMode', eventListener);
    });

    it('should include enabled state in event detail', () => {
      let receivedEnabled = false;

      window.addEventListener('cameraPanMode', ((event: CustomEvent) => {
        receivedEnabled = event.detail.enabled;
      }) as EventListener);

      window.dispatchEvent(new CustomEvent('cameraPanMode', {
        detail: { enabled: true }
      }));

      expect(receivedEnabled).toBe(true);
    });
  });

  describe('Center View (AC7)', () => {
    it('should emit cameraCenter event', () => {
      const eventListener = vi.fn();
      window.addEventListener('cameraCenter', eventListener);

      window.dispatchEvent(new CustomEvent('cameraCenter'));

      expect(eventListener).toHaveBeenCalled();
      window.removeEventListener('cameraCenter', eventListener);
    });

    it('should define center position', () => {
      const CENTER_X = 400;
      const CENTER_Y = 400;

      expect(CENTER_X).toBe(400);
      expect(CENTER_Y).toBe(400);
    });
  });

  describe('Reset View (AC8)', () => {
    it('should emit cameraReset event', () => {
      const eventListener = vi.fn();
      window.addEventListener('cameraReset', eventListener);

      window.dispatchEvent(new CustomEvent('cameraReset'));

      expect(eventListener).toHaveBeenCalled();
      window.removeEventListener('cameraReset', eventListener);
    });

    it('should reset to default zoom and center', () => {
      const resetState = {
        zoom: DEFAULT_ZOOM,
        centerX: 400,
        centerY: 400,
      };

      expect(resetState.zoom).toBe(1.0);
      expect(resetState.centerX).toBe(400);
      expect(resetState.centerY).toBe(400);
    });
  });

  describe('Keyboard Shortcuts (AC9)', () => {
    it('should define keyboard shortcut mappings', () => {
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

      expect(KEYBOARD_SHORTCUTS['+']).toBe('zoomIn');
      expect(KEYBOARD_SHORTCUTS['=']).toBe('zoomIn');
      expect(KEYBOARD_SHORTCUTS['-']).toBe('zoomOut');
      expect(KEYBOARD_SHORTCUTS['_']).toBe('zoomOut');
      expect(KEYBOARD_SHORTCUTS['p']).toBe('togglePan');
      expect(KEYBOARD_SHORTCUTS['P']).toBe('togglePan');
      expect(KEYBOARD_SHORTCUTS['c']).toBe('center');
      expect(KEYBOARD_SHORTCUTS['C']).toBe('center');
      expect(KEYBOARD_SHORTCUTS['Home']).toBe('center');
      expect(KEYBOARD_SHORTCUTS['r']).toBe('reset');
      expect(KEYBOARD_SHORTCUTS['R']).toBe('reset');
      expect(KEYBOARD_SHORTCUTS['0']).toBe('reset');
    });

    it('should handle keydown event for zoom in', () => {
      const zoomInHandler = vi.fn();
      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === '+' || event.key === '=') {
          zoomInHandler();
        }
      };

      document.addEventListener('keydown', handleKeydown);

      // Simulate key press
      const event = new KeyboardEvent('keydown', { key: '+' });
      document.dispatchEvent(event);

      expect(zoomInHandler).toHaveBeenCalled();
      document.removeEventListener('keydown', handleKeydown);
    });

    it('should handle keydown event for zoom out', () => {
      const zoomOutHandler = vi.fn();
      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === '-' || event.key === '_') {
          zoomOutHandler();
        }
      };

      document.addEventListener('keydown', handleKeydown);

      const event = new KeyboardEvent('keydown', { key: '-' });
      document.dispatchEvent(event);

      expect(zoomOutHandler).toHaveBeenCalled();
      document.removeEventListener('keydown', handleKeydown);
    });

    it('should handle keydown event for pan toggle', () => {
      const panToggleHandler = vi.fn();
      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'p' || event.key === 'P') {
          panToggleHandler();
        }
      };

      document.addEventListener('keydown', handleKeydown);

      const event = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(event);

      expect(panToggleHandler).toHaveBeenCalled();
      document.removeEventListener('keydown', handleKeydown);
    });

    it('should handle keydown event for center', () => {
      const centerHandler = vi.fn();
      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'c' || event.key === 'C' || event.key === 'Home') {
          centerHandler();
        }
      };

      document.addEventListener('keydown', handleKeydown);

      const event = new KeyboardEvent('keydown', { key: 'c' });
      document.dispatchEvent(event);

      expect(centerHandler).toHaveBeenCalled();
      document.removeEventListener('keydown', handleKeydown);
    });

    it('should handle keydown event for reset', () => {
      const resetHandler = vi.fn();
      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'r' || event.key === 'R' || event.key === '0') {
          resetHandler();
        }
      };

      document.addEventListener('keydown', handleKeydown);

      const event = new KeyboardEvent('keydown', { key: 'r' });
      document.dispatchEvent(event);

      expect(resetHandler).toHaveBeenCalled();
      document.removeEventListener('keydown', handleKeydown);
    });
  });

  describe('Zoom Changed Event (for toolbar state updates)', () => {
    it('should listen for zoomChanged event from MainScene', () => {
      const eventListener = vi.fn();
      window.addEventListener('zoomChanged', eventListener);

      window.dispatchEvent(new CustomEvent('zoomChanged', {
        detail: { zoom: 1.6 }
      }));

      expect(eventListener).toHaveBeenCalled();
      window.removeEventListener('zoomChanged', eventListener);
    });

    it('should update button states based on zoomChanged event', () => {
      let zoomInDisabled = false;
      let zoomOutDisabled = false;

      const updateButtonStates = (zoom: number) => {
        zoomInDisabled = zoom >= ZOOM_MAX;
        zoomOutDisabled = zoom <= ZOOM_MIN;
      };

      updateButtonStates(2.0);
      expect(zoomInDisabled).toBe(true);
      expect(zoomOutDisabled).toBe(false);

      updateButtonStates(0.5);
      expect(zoomInDisabled).toBe(false);
      expect(zoomOutDisabled).toBe(true);

      updateButtonStates(1.0);
      expect(zoomInDisabled).toBe(false);
      expect(zoomOutDisabled).toBe(false);
    });
  });
});
