export const TIZEN_KEYS = {
  // D-pad
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  ENTER: 13,

  // Back/Return
  BACK: 10009,

  // Media
  PLAY: 415,
  PAUSE: 19,
  STOP: 413,
  FAST_FORWARD: 417,
  REWIND: 412,
  PLAY_PAUSE: 10252,

  // Color buttons
  RED: 403,
  GREEN: 404,
  YELLOW: 405,
  BLUE: 406,

  // Channel
  CH_UP: 427,
  CH_DOWN: 428,

  // Volume
  VOL_UP: 447,
  VOL_DOWN: 448,
  MUTE: 449,

  // Numbers
  NUM_0: 48,
  NUM_1: 49,
  NUM_2: 50,
  NUM_3: 51,
  NUM_4: 52,
  NUM_5: 53,
  NUM_6: 54,
  NUM_7: 55,
  NUM_8: 56,
  NUM_9: 57,

  // Extra
  INFO: 457,
  GUIDE: 458,
  MENU: 10135,
  SOURCE: 10072,
  EXIT: 10182
} as const;

export const TIZEN_KEY_MAP: Record<number, { key: string, code: string }> = {
  [TIZEN_KEYS.PLAY]: { key: 'MediaPlay', code: 'MediaPlay' },
  [TIZEN_KEYS.PAUSE]: { key: 'MediaPause', code: 'MediaPause' },
  [TIZEN_KEYS.STOP]: { key: 'MediaStop', code: 'MediaStop' },
  [TIZEN_KEYS.FAST_FORWARD]: { key: 'MediaFastForward', code: 'MediaFastForward' },
  [TIZEN_KEYS.REWIND]: { key: 'MediaRewind', code: 'MediaRewind' },
  [TIZEN_KEYS.PLAY_PAUSE]: { key: 'MediaPlayPause', code: 'MediaPlayPause' },
  [TIZEN_KEYS.RED]: { key: 'ColorF0Red', code: 'ColorF0Red' },
  [TIZEN_KEYS.GREEN]: { key: 'ColorF1Green', code: 'ColorF1Green' },
  [TIZEN_KEYS.YELLOW]: { key: 'ColorF2Yellow', code: 'ColorF2Yellow' },
  [TIZEN_KEYS.BLUE]: { key: 'ColorF3Blue', code: 'ColorF3Blue' },
  [TIZEN_KEYS.CH_UP]: { key: 'ChannelUp', code: 'ChannelUp' },
  [TIZEN_KEYS.CH_DOWN]: { key: 'ChannelDown', code: 'ChannelDown' },
  [TIZEN_KEYS.INFO]: { key: 'Info', code: 'Info' },
  [TIZEN_KEYS.GUIDE]: { key: 'Guide', code: 'Guide' }
};

export function registerTizenKeys() {
  const keysToRegister = [
    'MediaPlay',
    'MediaPause',
    'MediaStop',
    'MediaFastForward',
    'MediaRewind',
    'MediaPlayPause',
    'Play',
    'Pause',
    'PlayPause',
    'FastForward',
    'Rewind',
    'ColorF0Red',
    'ColorF1Green',
    'ColorF2Yellow',
    'ColorF3Blue',
    'ChannelUp',
    'ChannelDown',
    'Info',
    'Guide',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ];

  if (typeof (window as any).tizen === 'undefined' || !(window as any).tizen.tvinputdevice) return;

  keysToRegister.forEach(keyName => {
    try {
      (window as any).tizen.tvinputdevice.registerKey(keyName);
    } catch {}
  });
}

let playTogglePending = false;
let activePlayPromise: Promise<void> | null = null;

async function safeTogglePlay(video: HTMLVideoElement, action: 'play' | 'pause' | 'toggle' = 'toggle') {
  if (!video || playTogglePending) return;
  playTogglePending = true;

  try {
    const shouldPlay = action === 'play' || (action === 'toggle' && video.paused);
    if (shouldPlay) {
      if (video.paused) {
        const p = video.play();
        activePlayPromise = p;
        await p;
        activePlayPromise = null;
      }
    } else {
      if (activePlayPromise) {
        try {
          await activePlayPromise;
        } catch {}
        activePlayPromise = null;
      }
      if (!video.paused) {
        video.pause();
      }
    }
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      console.warn('[TV-Video] play/pause error:', err);
    }
  } finally {
    setTimeout(() => { playTogglePending = false; }, 350);
  }
}

function handleBackAction(e?: Event) {
  if (e) {
    try {
      e.preventDefault();
      e.stopPropagation();
    } catch {}
  }

  // 1. If in player (fullscreen or not)
  if (location.hash.includes('/app/player')) {
    // Check if player options menu or tree is open
    const isOptionsOpen = typeof (window as any).__hayaseIsPlayerOptionsOpen === 'function' && (window as any).__hayaseIsPlayerOptionsOpen();
    const optionsDialog = isOptionsOpen || document.querySelector('.options-dialog-content, [role="dialog"][data-state="open"]');

    if (optionsDialog) {
      // First try collapsing a submenu level (e.g. from Audio -> Languages back to Audio root)
      if (typeof (window as any).__hayaseCollapseTreeSubmenu === 'function' && (window as any).__hayaseCollapseTreeSubmenu()) {
        return;
      }
      // Otherwise close the options dialog completely
      if (typeof (window as any).__hayaseClosePlayerOptions === 'function') {
        (window as any).__hayaseClosePlayerOptions();
        return;
      }
      const closeBtn = document.querySelector<HTMLElement>('.options-dialog-content [data-dialog-close], .options-dialog-content button[aria-label="Close"]');
      if (closeBtn) {
        closeBtn.click();
        return;
      }
    }

    // If options is not open, exit the player completely and restore the previous screen
    if (typeof (window as any).__hayaseTvExitPlayer === 'function') {
      (window as any).__hayaseTvExitPlayer();
    } else {
      const video = document.querySelector('video');
      if (video) {
        try { video.pause(); video.src = ''; } catch {}
      }
      const target = document.getElementById('episodeListTarget');
      target?.classList.remove('custom-fullscreen');
      document.body.classList.remove('is-fullscreen');
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      location.hash = '#/app/home';
    }
    return;
  }

  // 2. Close any open modals, dropdowns, or overlays outside player
  const hasModal = document.querySelector('[role="dialog"][data-state="open"], [data-vaul-drawer][data-state="open"]');
  if (hasModal) {
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true });
    (document.activeElement || document.body).dispatchEvent(escEvent);
    return;
  }

  // 3. Exit fullscreen if in custom or native fullscreen
  const target = document.getElementById('episodeListTarget');
  if (document.fullscreenElement || target?.classList.contains('custom-fullscreen') || document.body.classList.contains('is-fullscreen')) {
    target?.classList.remove('custom-fullscreen');
    document.body.classList.remove('is-fullscreen');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    return;
  }

  // 4. If video is playing in miniplayer, pause/close it
  const video = document.querySelector('video');
  if (video && !video.paused) {
    video.pause();
    return;
  }

  // 5. If home screen, exit the app
  const hash = location.hash || '';
  const isHome = hash === '' || hash === '#/' || hash === '#/app/home';
  if (isHome) {
    try {
      (window as any).tizen?.application?.getCurrentApplication?.()?.exit?.();
    } catch (err) {
      console.warn('Failed to exit application', err);
    }
  } else {
    history.back();
  }
}

export function initTizenInput() {
  registerTizenKeys();

  // Listen for Samsung hardware key events (e.g. Back button)
  window.addEventListener('tizenhwkey', (e: any) => {
    if (e.keyName === 'back') {
      handleBackAction(e);
    }
  }, true);

  // Use capture phase so we intercept before any component listeners
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const keyCode = e.keyCode || e.which;

    // 1. Normalize D-pad and Enter keys
    let normalizedKey: string | undefined;
    let normalizedCode: string | undefined;

    switch (keyCode) {
      case TIZEN_KEYS.ARROW_UP:
        normalizedKey = 'ArrowUp';
        normalizedCode = 'ArrowUp';
        break;
      case TIZEN_KEYS.ARROW_DOWN:
        normalizedKey = 'ArrowDown';
        normalizedCode = 'ArrowDown';
        break;
      case TIZEN_KEYS.ARROW_LEFT:
        normalizedKey = 'ArrowLeft';
        normalizedCode = 'ArrowLeft';
        break;
      case TIZEN_KEYS.ARROW_RIGHT:
        normalizedKey = 'ArrowRight';
        normalizedCode = 'ArrowRight';
        break;
      case TIZEN_KEYS.ENTER:
        normalizedKey = 'Enter';
        normalizedCode = 'Enter';
        break;
    }

    if (normalizedKey) {
      if (!e.key || e.key !== normalizedKey) {
        try {
          Object.defineProperty(e, 'key', { value: normalizedKey, configurable: true });
        } catch {}
      }
      if (!e.code || e.code !== normalizedCode) {
        try {
          Object.defineProperty(e, 'code', { value: normalizedCode, configurable: true });
        } catch {}
      }

      // If activeElement is body or missing on arrow press, focus first element
      if (keyCode !== TIZEN_KEYS.ENTER && (!document.activeElement || document.activeElement === document.body)) {
        const candidate = document.querySelector<HTMLElement>(
          'button:not([disabled]), [tabindex="0"], a[href]:not([disabled]), .cursor-pointer'
        );
        if (candidate) candidate.focus();
      }

      // Synthetic Enter dispatch: ONLY for non-button, non-link elements (custom div cards)
      // Standard BUTTON and A elements already receive native browser click on Enter keydown/keyup
      if (keyCode === TIZEN_KEYS.ENTER) {
        setTimeout(() => {
          if (!e.defaultPrevented && document.activeElement && document.activeElement !== document.body) {
            const target = document.activeElement as HTMLElement;
            // CRITICAL: NEVER fire synthetic click on BUTTON or A - it triggers an instant double-click!
            if (target.tagName !== 'BUTTON' && target.tagName !== 'A') {
              if (
                target.getAttribute('role') === 'button' ||
                target.getAttribute('tabindex') === '0' ||
                target.tabIndex === 0 ||
                target.classList.contains('cursor-pointer')
              ) {
                target.click();
              }
            }
          }
        }, 10);
      }
      return;
    }

    // 2. Handle Back/Return button (10009)
    if (keyCode === TIZEN_KEYS.BACK) {
      handleBackAction(e);
      return;
    }

    // 3. Handle Play / Pause / PlayPause buttons on TV
    if (keyCode === TIZEN_KEYS.PLAY) {
      e.preventDefault();
      e.stopPropagation();
      const video = document.querySelector('video');
      if (video) safeTogglePlay(video, 'play');
      return;
    }

    if (keyCode === TIZEN_KEYS.PAUSE) {
      e.preventDefault();
      e.stopPropagation();
      const video = document.querySelector('video');
      if (video) safeTogglePlay(video, 'pause');
      return;
    }

    if (keyCode === TIZEN_KEYS.PLAY_PAUSE) {
      e.preventDefault();
      e.stopPropagation();
      const video = document.querySelector('video');
      if (video) safeTogglePlay(video, 'toggle');
      return;
    }

    // 4. Handle Fast Forward / Rewind buttons
    if (keyCode === TIZEN_KEYS.FAST_FORWARD || keyCode === TIZEN_KEYS.REWIND) {
      e.preventDefault();
      e.stopPropagation();

      const delta = keyCode === TIZEN_KEYS.FAST_FORWARD ? 10 : -10;
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
      }

      const arrowKey = keyCode === TIZEN_KEYS.FAST_FORWARD ? 'ArrowRight' : 'ArrowLeft';
      const arrowCode = keyCode === TIZEN_KEYS.FAST_FORWARD ? 39 : 37;
      (document.activeElement || window).dispatchEvent(new KeyboardEvent('keydown', {
        key: arrowKey,
        code: arrowKey,
        keyCode: arrowCode,
        which: arrowCode,
        bubbles: true
      }));
      return;
    }

    // 5. Other media and color keys mapping
    const mapping = TIZEN_KEY_MAP[keyCode];
    if (mapping) {
      e.preventDefault();
      const target = (document.activeElement as HTMLElement | null) ?? document.body;
      target.dispatchEvent(new KeyboardEvent('keydown', { 
        key: mapping.key, 
        code: mapping.code, 
        bubbles: true 
      }));
    }
  }, true);
}

