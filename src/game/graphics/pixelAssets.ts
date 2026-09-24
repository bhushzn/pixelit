// Pixel Art Asset Generator for Pixel Rush
// Procedurally generates authentic, high-detail 2D pixel-art sprite sheets and textures

export class PixelAssets {
  /**
   * Helper to set a crisp pixel block on a 2D canvas context
   */
  public static setPixel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    pixelSize = 1
  ): void {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x * pixelSize), Math.floor(y * pixelSize), pixelSize, pixelSize);
  }

  /**
   * Generates the Player "Rush Aviator" multi-frame pixel-art sprite sheet
   * 48x48 frame size, containing:
   * - Idle: 4 frames
   * - Run: 6 frames
   * - Jump: 2 frames (rise, apex)
   * - Fall: 2 frames
   * - Dash: 2 frames
   * - Hit: 2 frames
   */
  public static generatePlayerSpriteSheet(): HTMLCanvasElement {
    const frameW = 48;
    const frameH = 48;
    const totalFrames = 18; // 4 idle + 6 run + 2 jump + 2 fall + 2 dash + 2 hit
    const canvas = document.createElement('canvas');
    canvas.width = frameW * totalFrames;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Palette:
    // Outline: #131b2e (deep navy ink)
    // Skin: #ffe4c4 (peach), shade: #fca5a5
    // Goggles: #38bdf8 (cyan), frame: #0369a1, glint: #ffffff
    // Cap: #0284c7 (pilot blue), brim: #0369a1
    // Scarf: #f43f5e (crimson red), highlight: #fb7185
    // Jacket: #fea619 (amber gold), shadow: #d97706, trim: #78350f
    // Pants: #1e293b (slate charcoal)
    // Boots: #991b1b (deep red racing boots) with white soles #ffffff

    const drawCharacterFrame = (
      frameIndex: number,
      pose: 'idle' | 'run' | 'jump' | 'fall' | 'dash' | 'hit',
      step: number
    ) => {
      const ox = frameIndex * frameW;
      const oy = 0;

      // Base body offsets based on animation step
      let bobY = 0;
      let legAngle = 0; // -1 to 1
      let armAngle = 0;
      let scarfFlutter = (step % 2) * 2;

      if (pose === 'idle') {
        bobY = step === 1 || step === 3 ? 1 : 0;
      } else if (pose === 'run') {
        bobY = step % 2 === 0 ? 0 : 2;
        legAngle = Math.sin((step / 6) * Math.PI * 2);
        armAngle = -legAngle;
      } else if (pose === 'jump') {
        bobY = -3;
        scarfFlutter = -2;
      } else if (pose === 'fall') {
        bobY = 1;
        scarfFlutter = 3;
      } else if (pose === 'dash') {
        bobY = 2;
        scarfFlutter = 4;
      } else if (pose === 'hit') {
        bobY = 0;
      }

      ctx.save();
      ctx.translate(ox + 24, oy + 26 + bobY);

      // Pixel scale: 2x2 per pixel art coordinate
      const P = 2;
      const p = (x: number, y: number, col: string) => {
        ctx.fillStyle = col;
        ctx.fillRect(x * P, y * P, P, P);
      };

      const rect = (x: number, y: number, w: number, h: number, col: string) => {
        ctx.fillStyle = col;
        ctx.fillRect(x * P, y * P, w * P, h * P);
      };

      // 1. Drop shadow under character
      if (pose !== 'jump' && pose !== 'fall') {
        rect(-6, 8, 12, 2, 'rgba(15, 23, 42, 0.25)');
      }

      // 2. Trailing Scarf (Fluttering behind)
      if (pose === 'dash') {
        rect(-14 - scarfFlutter, -2, 8, 3, '#f43f5e');
        rect(-16 - scarfFlutter, -1, 4, 2, '#fb7185');
        rect(-10, -2, 5, 3, '#e11d48');
      } else {
        rect(-9 - scarfFlutter, -3, 5, 3, '#f43f5e');
        rect(-7, -2, 3, 3, '#e11d48');
        rect(-11 - scarfFlutter, -2, 3, 2, '#fb7185');
      }

      // 3. Legs & Boots
      if (pose === 'idle') {
        // Left leg
        rect(-4, 4, 3, 4, '#1e293b');
        rect(-5, 7, 4, 3, '#991b1b');
        rect(-5, 9, 4, 1, '#ffffff'); // sneaker trim

        // Right leg
        rect(1, 4, 3, 4, '#334155');
        rect(1, 7, 4, 3, '#dc2626');
        rect(1, 9, 4, 1, '#ffffff');
      } else if (pose === 'run') {
        const leftOff = Math.round(legAngle * 4);
        const rightOff = -leftOff;

        // Back leg
        rect(-3 - leftOff, 4, 3, 3, '#1e293b');
        rect(-4 - leftOff, 6, 4, 3, '#991b1b');
        rect(-4 - leftOff, 8, 4, 1, '#ffffff');

        // Front leg
        rect(0 + rightOff, 4, 3, 3, '#334155');
        rect(-1 + rightOff, 6, 4, 3, '#dc2626');
        rect(-1 + rightOff, 8, 4, 1, '#ffffff');
      } else if (pose === 'jump') {
        // Tucked jump legs
        rect(-4, 3, 3, 3, '#1e293b');
        rect(-5, 4, 4, 3, '#991b1b');
        rect(1, 3, 3, 3, '#334155');
        rect(1, 4, 4, 3, '#dc2626');
      } else if (pose === 'fall') {
        // Extended fall legs
        rect(-4, 4, 3, 5, '#1e293b');
        rect(-5, 8, 4, 3, '#991b1b');
        rect(1, 4, 3, 5, '#334155');
        rect(1, 8, 4, 3, '#dc2626');
      } else if (pose === 'dash') {
        // Streamlined horizontal legs
        rect(-7, 3, 5, 2, '#1e293b');
        rect(-9, 3, 3, 3, '#991b1b');
        rect(-4, 4, 5, 2, '#334155');
        rect(-6, 5, 3, 3, '#dc2626');
      } else if (pose === 'hit') {
        // Splayed recoil legs
        rect(-6, 4, 4, 4, '#1e293b');
        rect(-7, 7, 4, 3, '#991b1b');
        rect(2, 4, 4, 4, '#334155');
        rect(3, 7, 4, 3, '#dc2626');
      }

      // 4. Torso / Jacket
      rect(-5, -2, 10, 7, '#fea619'); // Main gold jacket
      rect(-5, 3, 10, 2, '#d97706'); // Lower shadow
      rect(-1, -2, 2, 6, '#78350f'); // Center zipper
      rect(-5, 3, 10, 1, '#1e293b'); // Utility belt
      p(0, 3, '#fde047'); // Brass buckle

      // 5. Head & Aviator Cap
      rect(-4, -8, 8, 7, '#ffe4c4'); // Peach face
      rect(-5, -10, 10, 4, '#0284c7'); // Blue aviator cap
      rect(-6, -8, 3, 3, '#0369a1'); // Earflap
      rect(3, -8, 3, 3, '#0369a1');

      // 6. Goggles (Signature Pixel Aviator look)
      rect(-4, -9, 4, 3, '#0369a1'); // Left frame
      rect(0, -9, 4, 3, '#0369a1'); // Right frame
      rect(-3, -9, 2, 2, '#38bdf8'); // Cyan lens
      rect(1, -9, 2, 2, '#38bdf8');
      p(-3, -9, '#ffffff'); // Glint
      p(1, -9, '#ffffff');

      // 7. Facial Details (Eyes / Smile / Dizzy)
      if (pose === 'hit') {
        // Dizzy X eyes
        p(-2, -6, '#1e293b'); p(0, -6, '#1e293b');
        p(-1, -5, '#1e293b');
        p(2, -6, '#1e293b'); p(4, -6, '#1e293b');
        p(3, -5, '#1e293b');
      } else {
        // Determined Pixel Eyes
        p(-2, -6, '#0f172a');
        p(2, -6, '#0f172a');
        p(-2, -7, '#38bdf8'); // Eye glimmer
        p(2, -7, '#38bdf8');

        // Confident smirk
        rect(0, -4, 2, 1, '#9a3412');
      }

      // 8. Hands / Arms
      if (pose === 'run') {
        const armX = Math.round(armAngle * 4);
        rect(-6 + armX, 0, 3, 4, '#d97706');
        rect(3 - armX, 0, 3, 4, '#fea619');
        rect(-6 + armX, 3, 3, 2, '#ffe4c4');
        rect(3 - armX, 3, 3, 2, '#ffe4c4');
      } else if (pose === 'dash') {
        rect(3, -1, 6, 2, '#fea619'); // Arms pointed forward
        rect(7, -1, 3, 2, '#ffe4c4');
      } else if (pose === 'jump') {
        rect(-7, -4, 3, 4, '#fea619');
        rect(4, -4, 3, 4, '#fea619');
        rect(-7, -6, 3, 2, '#ffe4c4');
        rect(4, -6, 3, 2, '#ffe4c4');
      } else {
        rect(-6, 0, 2, 4, '#d97706');
        rect(4, 0, 2, 4, '#fea619');
        rect(-6, 3, 2, 2, '#ffe4c4');
        rect(4, 3, 2, 2, '#ffe4c4');
      }

      ctx.restore();
    };

    // Frame 0..3: Idle (4 frames)
    for (let i = 0; i < 4; i++) {
      drawCharacterFrame(i, 'idle', i);
    }
    // Frame 4..9: Run (6 frames)
    for (let i = 0; i < 6; i++) {
      drawCharacterFrame(4 + i, 'run', i);
    }
    // Frame 10..11: Jump (2 frames)
    drawCharacterFrame(10, 'jump', 0);
    drawCharacterFrame(11, 'jump', 1);
    // Frame 12..13: Fall (2 frames)
    drawCharacterFrame(12, 'fall', 0);
    drawCharacterFrame(13, 'fall', 1);
    // Frame 14..15: Dash (2 frames)
    drawCharacterFrame(14, 'dash', 0);
    drawCharacterFrame(15, 'dash', 1);
    // Frame 16..17: Hit (2 frames)
    drawCharacterFrame(16, 'hit', 0);
    drawCharacterFrame(17, 'hit', 1);

    return canvas;
  }

  /**
   * Generates authentic 2D Pixel-Art Grass/Rock/Soil Floating Island Tile
   * 128x64 repeating tile with rich layered strata, roots, and hanging rocks
   */
  public static generateGrassPlatformTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const P = 2; // 2x2 pixel cluster scale
    const p = (x: number, y: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, P, P);
    };
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, w * P, h * P);
    };

    // 1. Base Soil & Earth Block (W: 64 virtual pixels, H: 32 virtual pixels)
    rect(0, 4, 64, 28, '#593a1c'); // Dark rich loam
    rect(0, 8, 64, 24, '#422711'); // Deep subsoil

    // 2. Stratified Rock Layers inside the island
    for (let x = 0; x < 64; x += 16) {
      rect(x + 2, 14, 12, 6, '#334155'); // Slate bedrock
      rect(x + 3, 14, 10, 1, '#475569'); // Stone top highlight
      rect(x + 2, 19, 12, 1, '#1e293b'); // Stone bottom shadow
    }

    for (let x = 8; x < 64; x += 16) {
      rect(x + 1, 22, 14, 5, '#292524'); // Basalt vein
      rect(x + 2, 22, 12, 1, '#44403c');
      rect(x + 1, 26, 14, 1, '#1c1917');
    }

    // 3. Exposed Soil Pebbles & Roots
    for (let x = 4; x < 64; x += 9) {
      p(x, 10, '#854d0e');
      p(x + 1, 11, '#713f12');
      p(x + 4, 12, '#92400e');
    }

    // 4. Lush Pixel Grass Fringe across Top (3 tiered greens)
    // Top Grass Highlight Stripe
    rect(0, 1, 64, 2, '#4ade80'); // Vibrant sunlit lime green
    rect(0, 0, 64, 1, '#86efac'); // Edge specular highlight

    // Mid Grass Body
    rect(0, 3, 64, 3, '#16a34a'); // Deep emerald
    rect(0, 6, 64, 2, '#15803d'); // Underside grass shadow

    // Scalloped Grass Hanging Teeth (pixel fringe)
    for (let x = 0; x < 64; x += 3) {
      const toothLen = (x * 7) % 3 + 1;
      rect(x, 8, 2, toothLen, '#15803d');
      p(x, 8 + toothLen, '#166534');
    }

    // Scattered Little Wildflowers & Clover Tufts on Grass
    for (let x = 3; x < 64; x += 11) {
      p(x, 0, '#ffffff'); // White daisy petal
      p(x + 1, 0, '#fef08a'); // Flower yellow eye
      p(x + 2, 0, '#ffffff');
      p(x + 1, 1, '#15803d'); // Stem
    }

    // 5. Hanging Bottom Crags & Roots (Tapered island bottom)
    for (let x = 2; x < 64; x += 8) {
      const cragLen = ((x * 13) % 4) + 1;
      rect(x, 28, 3, cragLen, '#2a1a0c');
      p(x + 1, 28 + cragLen, '#1a1007');
    }

    return canvas;
  }

  /**
   * Generates 2D Pixel-Art Cloud Platform Texture
   * Volumetric pixel fluff with crisp contours and indigo/cyan ambient depth
   */
  public static generateCloudPlatformTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const P = 2;
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, w * P, h * P);
    };

    // Cloud Lobe Dimensions in virtual pixels (64 x 24)
    // 1. Deep underside ambient shadow (indigo-cyan)
    rect(2, 14, 60, 8, '#7dd3fc');
    rect(6, 18, 52, 5, '#38bdf8');
    rect(12, 21, 40, 3, '#0284c7');

    // 2. Midtone cloud body (crisp sky white)
    rect(2, 6, 60, 10, '#f0f9ff');
    rect(4, 4, 56, 12, '#ffffff');

    // 3. Fluffy Top Cloud Puffs (stepped pixel lobes)
    // Lobe 1 (Left)
    rect(6, 2, 14, 4, '#ffffff');
    rect(8, 0, 10, 2, '#ffffff');
    rect(10, -1, 6, 1, '#ffffff');

    // Lobe 2 (Center Major)
    rect(24, 1, 18, 5, '#ffffff');
    rect(27, -1, 12, 2, '#ffffff');

    // Lobe 3 (Right)
    rect(44, 2, 14, 4, '#ffffff');
    rect(46, 0, 10, 2, '#ffffff');

    // 4. Crisp Pixel Rim Highlights
    rect(8, 0, 10, 1, '#ffffff');
    rect(27, -1, 12, 1, '#ffffff');
    rect(46, 0, 10, 1, '#ffffff');

    // 5. Subtle Soft Blue Puff Contours inside cloud
    rect(14, 10, 12, 2, '#e0f2fe');
    rect(36, 11, 14, 2, '#e0f2fe');

    return canvas;
  }

  /**
   * Generates 2D Pixel-Art Trampoline Bounce Pad Texture
   * Heavy industrial steel spring with striped vulcanized rubber cushion
   */
  public static generateBouncePlatformTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 44;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const P = 2;
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, w * P, h * P);
    };

    // 1. Anchored Iron Base Plate
    rect(4, 18, 56, 4, '#1e293b');
    rect(6, 16, 52, 2, '#475569');
    rect(8, 15, 48, 1, '#94a3b8'); // Metallic rim

    // 2. Heavy Steel Compression Springs
    for (let x = 12; x < 52; x += 14) {
      rect(x, 10, 6, 2, '#94a3b8');
      rect(x + 1, 12, 4, 2, '#64748b');
      rect(x, 14, 6, 2, '#475569');
    }

    // 3. Bouncy Vulcanized Rubber Pad (Vibrant Orange & Yellow warning pattern)
    rect(2, 3, 60, 7, '#d97706'); // Deep amber base
    rect(4, 1, 56, 8, '#fea619'); // Cheerful bright amber
    rect(6, 0, 52, 2, '#ffedd5'); // Top impact highlight

    // 4. Cheerful Chevron Arrow on Pad (Ready to launch!)
    for (let x = 24; x <= 40; x += 8) {
      rect(x, 3, 4, 3, '#78350f');
    }

    return canvas;
  }

  /**
   * Generates 2D Pixel-Art Sky-Tech Mechanical Hover Platform
   * Riveted brass & steel barge with glowing cyan thrusters
   */
  public static generateHoverPlatformTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const P = 2;
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, w * P, h * P);
    };

    // 1. Brass chassis with riveted steel girders
    rect(2, 2, 60, 14, '#b45309'); // Brass frame
    rect(4, 3, 56, 12, '#d97706');
    rect(6, 1, 52, 2, '#fde68a'); // Top metal highlight
    rect(4, 14, 56, 3, '#78350f'); // Shadow trim

    // 2. Rivets along girder
    for (let x = 6; x < 58; x += 8) {
      rect(x, 4, 2, 2, '#fef08a');
      rect(x, 6, 2, 1, '#92400e');
    }

    // 3. Cyan Energy Thrusters on Underside
    rect(12, 16, 10, 4, '#1e293b');
    rect(42, 16, 10, 4, '#1e293b');
    rect(14, 18, 6, 3, '#38bdf8'); // Plasma glow
    rect(44, 18, 6, 3, '#38bdf8');
    rect(15, 20, 4, 2, '#ffffff');
    rect(45, 20, 4, 2, '#ffffff');

    // 4. Center Warning Chevron Strip
    for (let x = 24; x < 40; x += 4) {
      rect(x, 6, 2, 6, (x / 4) % 2 === 0 ? '#1e293b' : '#fde047');
    }

    return canvas;
  }

  /**
   * Generates 2D Pixel-Art Boost Pad Texture
   * Radiant cyan speed conveyor with animated glowing arrows
   */
  public static generateBoostPadTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const P = 2;
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, w * P, h * P);
    };

    // 1. Neon Track Housing
    rect(0, 2, 64, 14, '#0f172a'); // Dark titanium housing
    rect(2, 4, 60, 10, '#0369a1'); // Cyan energy duct
    rect(2, 1, 60, 2, '#38bdf8'); // Top rail

    // 2. High-speed Glowing Chevrons pointing Right
    for (let x = 6; x < 58; x += 12) {
      rect(x, 4, 2, 8, '#ffffff');
      rect(x + 2, 5, 2, 6, '#bae6fd');
      rect(x + 4, 6, 2, 4, '#38bdf8');
      rect(x + 6, 7, 2, 2, '#0284c7');
    }

    return canvas;
  }

  /**
   * Generates 6-frame Pixel-Art Spinning Gold Coin Sprite Sheet (192x32)
   */
  public static generateCoinSpriteSheet(): HTMLCanvasElement {
    const frameW = 32;
    const frameH = 32;
    const frames = 6;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * frames;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const widths = [12, 9, 5, 2, 5, 9]; // Width of coin face in virtual pixels

    for (let f = 0; f < frames; f++) {
      const ox = f * frameW + 16;
      const oy = 16;
      const w = widths[f];

      ctx.save();
      ctx.translate(ox, oy);

      const P = 2;
      const rect = (x: number, y: number, rw: number, rh: number, col: string) => {
        ctx.fillStyle = col;
        ctx.fillRect(x * P, y * P, rw * P, rh * P);
      };

      // Outer gold rim
      rect(-w / 2, -6, w, 12, '#b45309');
      rect(-w / 2 + 1, -6, Math.max(1, w - 2), 12, '#fea619');
      rect(-w / 2 + 1, -5, Math.max(1, w - 2), 10, '#fde047');

      // White shine glint on front frames
      if (f === 0 || f === 1 || f === 5) {
        rect(-w / 2 + 2, -4, 2, 3, '#ffffff');
      }

      ctx.restore();
    }

    return canvas;
  }

  /**
   * Generates 4-frame Animated Flying Pixel Bird Sprite Sheet (96x24)
   * Brings lively sky ambiance to midground layers
   */
  public static generateBirdSpriteSheet(): HTMLCanvasElement {
    const frameW = 24;
    const frameH = 24;
    const frames = 4;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * frames;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < frames; f++) {
      const ox = f * frameW + 12;
      const oy = 12;

      ctx.save();
      ctx.translate(ox, oy);

      const P = 2;
      const p = (x: number, y: number, col: string) => {
        ctx.fillStyle = col;
        ctx.fillRect(x * P, y * P, P, P);
      };
      const rect = (x: number, y: number, w: number, h: number, col: string) => {
        ctx.fillStyle = col;
        ctx.fillRect(x * P, y * P, w * P, h * P);
      };

      // Bird body (White sky gull / dove)
      rect(-2, -1, 5, 2, '#ffffff');
      p(3, -1, '#f59e0b'); // Yellow beak
      p(1, -2, '#1e293b'); // Tiny eye

      // Flapping Wings
      if (f === 0) {
        // Wings Up
        rect(-3, -4, 2, 4, '#ffffff');
        rect(0, -4, 2, 4, '#e2e8f0');
      } else if (f === 1) {
        // Wings Level
        rect(-5, -2, 4, 2, '#ffffff');
        rect(1, -2, 4, 2, '#e2e8f0');
      } else if (f === 2) {
        // Wings Down
        rect(-3, 0, 2, 4, '#ffffff');
        rect(0, 0, 2, 4, '#cbd5e1');
      } else {
        // Wings Level Glide
        rect(-4, -1, 3, 2, '#ffffff');
        rect(1, -1, 3, 2, '#e2e8f0');
      }

      ctx.restore();
    }

    return canvas;
  }

  /**
   * Generates 4-frame Animated Checkpoint Flag Sprite Sheet (192x80)
   * Checkered silk pennant gracefully waving in the mountain breeze
   */
  public static generateCheckpointSpriteSheet(active: boolean): HTMLCanvasElement {
    const frameW = 48;
    const frameH = 80;
    const frames = 4;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * frames;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < frames; f++) {
      const ox = f * frameW;
      const P = 2;
      const rect = (x: number, y: number, w: number, h: number, col: string) => {
        ctx.fillStyle = col;
        ctx.fillRect(ox + x * P, y * P, w * P, h * P);
      };

      // 1. Stone pedestal base
      rect(6, 36, 12, 4, '#475569');
      rect(7, 35, 10, 2, '#64748b');

      // 2. Striped Wooden Pole
      rect(10, 6, 4, 30, '#b45309');
      rect(11, 6, 2, 30, '#d97706'); // Wood highlight

      // 3. Gold Pole Finial Cap
      rect(9, 4, 6, 3, '#f59e0b');
      rect(10, 3, 4, 1, '#fef08a');

      // 4. Waving Pennant Banner (Sine wave displacement)
      const waveOffset = Math.sin((f / frames) * Math.PI * 2);
      const flagCol1 = active ? '#10b981' : '#f59e0b';
      const flagCol2 = active ? '#059669' : '#d97706';

      for (let segment = 0; segment < 6; segment++) {
        const segX = 14 + segment * 2;
        const segY = 6 + Math.round(Math.sin((segment * 0.8) + (f * 1.5)) * 2);
        const segH = Math.max(2, 12 - segment * 2);

        rect(segX, segY, 2, segH, segment % 2 === 0 ? flagCol1 : flagCol2);
      }

      // Star Icon on active flag
      if (active) {
        rect(17, 9 + Math.round(waveOffset), 3, 3, '#ffffff');
      }
    }

    return canvas;
  }

  /**
   * Generates Grand Pixel-Art Finish Archway (160x180)
   * Ancient sky gate with checkered pillars, golden trophy crown, and banners
   */
  public static generateLargeFinishArchTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 180;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const P = 2;
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, w * P, h * P);
    };

    // 1. Left Pillar (Checkered Sky-Tech Column)
    rect(6, 20, 14, 68, '#1e293b');
    for (let y = 22; y < 86; y += 8) {
      rect(7, y, 6, 4, '#0284c7');
      rect(13, y, 6, 4, '#ffffff');
      rect(7, y + 4, 6, 4, '#ffffff');
      rect(13, y + 4, 6, 4, '#0284c7');
    }
    // Left Pillar Plinth & Capital
    rect(4, 84, 18, 6, '#f59e0b');
    rect(5, 18, 16, 4, '#f59e0b');

    // 2. Right Pillar (Checkered Sky-Tech Column)
    rect(60, 20, 14, 68, '#1e293b');
    for (let y = 22; y < 86; y += 8) {
      rect(61, y, 6, 4, '#ffffff');
      rect(67, y, 6, 4, '#0284c7');
      rect(61, y + 4, 6, 4, '#0284c7');
      rect(67, y + 4, 6, 4, '#ffffff');
    }
    // Right Pillar Plinth & Capital
    rect(58, 84, 18, 6, '#f59e0b');
    rect(59, 18, 16, 4, '#f59e0b');

    // 3. Grand Crossbeam Arch
    rect(4, 8, 72, 14, '#b45309');
    rect(6, 10, 68, 10, '#f59e0b');
    rect(8, 11, 64, 8, '#ffffff');

    // Bold Pixel "FINISH" lettering
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', 80, 36);

    // 4. Golden Trophy Crown on Summit
    rect(35, 1, 10, 8, '#f59e0b');
    rect(36, 0, 8, 2, '#fef08a'); // Trophy rim
    rect(37, 7, 6, 3, '#d97706'); // Stem
    rect(34, 9, 12, 2, '#b45309'); // Base

    // 5. Celebration Pennant Bunting hanging below arch
    for (let x = 16; x < 64; x += 8) {
      const col = (x / 8) % 2 === 0 ? '#f43f5e' : '#10b981';
      rect(x, 22, 6, 6, col);
      rect(x + 1, 28, 4, 2, col);
      rect(x + 2, 30, 2, 2, col);
    }

    return canvas;
  }

  /**
   * Generates Distant Sky Island with cascading pixel waterfall (160x100)
   */
  public static generateDistantSkyIslandTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const P = 2;
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, w * P, h * P);
    };

    // Soft sky-blue tinted silhouette for immense atmospheric depth
    // Island Rocky Underbelly
    rect(10, 20, 60, 15, 'rgba(125, 211, 252, 0.4)');
    rect(20, 35, 40, 10, 'rgba(56, 189, 248, 0.35)');
    rect(30, 45, 20, 5, 'rgba(2, 132, 199, 0.3)');

    // Island Lush Green Top
    rect(6, 16, 68, 5, 'rgba(74, 222, 128, 0.55)');
    rect(10, 14, 60, 2, 'rgba(134, 239, 172, 0.6)');

    // Miniature Sky Pines
    for (let x = 16; x < 64; x += 12) {
      rect(x + 2, 10, 2, 5, 'rgba(21, 128, 61, 0.65)');
      rect(x, 6, 6, 5, 'rgba(34, 197, 94, 0.7)');
      rect(x + 1, 3, 4, 4, 'rgba(74, 222, 128, 0.75)');
    }

    // Miniature Cascading Waterfall pouring into the sky abyss
    rect(42, 21, 4, 28, 'rgba(224, 242, 254, 0.75)');
    rect(43, 21, 2, 28, 'rgba(255, 255, 255, 0.9)');
    rect(40, 48, 8, 3, 'rgba(186, 230, 253, 0.5)'); // Splash mist

    return canvas;
  }

  /**
   * Generates 2D Pixel-Art Crystal Spike Hazard Texture (32x32)
   * Sharp, jagged crystalline clusters with deep violet/crimson corrupted core
   */
  public static generateCrystalHazardTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const P = 2;
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, w * P, h * P);
    };

    // Dark crystal base
    rect(1, 13, 14, 3, '#4c0519');
    rect(2, 12, 12, 2, '#881337');

    // Main Center Crystal Shard
    rect(7, 1, 2, 2, '#fecdd3'); // Tip glint
    rect(6, 3, 4, 3, '#f43f5e');
    rect(5, 6, 6, 4, '#e11d48');
    rect(5, 10, 6, 3, '#be123c');

    // Left Secondary Crystal
    rect(2, 5, 2, 2, '#fecdd3');
    rect(2, 7, 3, 3, '#fb7185');
    rect(2, 10, 4, 3, '#e11d48');

    // Right Secondary Crystal
    rect(12, 4, 2, 2, '#fecdd3');
    rect(11, 6, 3, 4, '#f43f5e');
    rect(10, 10, 4, 3, '#be123c');

    return canvas;
  }

  /**
   * Generates Landmark: Cloud Harbor Dock & Mooring Bollard (64x64)
   * Handcrafted timber dock pilings, mooring rope, and brass lantern
   */
  public static generateCloudHarborPropTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const P = 2;
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, w * P, h * P);
    };

    // Timber mooring post
    rect(6, 8, 8, 24, '#78350f');
    rect(7, 8, 6, 24, '#92400e');
    rect(8, 8, 4, 24, '#b45309'); // Wood highlight

    // Iron Bollard Cap
    rect(5, 6, 10, 3, '#1e293b');
    rect(7, 4, 6, 3, '#334155');

    // Coiled dock rope around post
    rect(5, 14, 10, 3, '#d97706');
    rect(5, 19, 10, 3, '#b45309');

    // Brass Lantern hanging from side arm
    rect(14, 10, 8, 2, '#78350f'); // Arm
    rect(20, 12, 4, 2, '#1e293b'); // Lantern roof
    rect(19, 14, 6, 7, '#f59e0b'); // Amber glass
    rect(21, 16, 2, 3, '#fef08a'); // Bright filament
    rect(20, 21, 4, 2, '#1e293b'); // Base

    return canvas;
  }

  /**
   * Generates Landmark: Ancient Sky Ruins Column (48x80)
   * Weathered marble fluted column with creeping emerald vines
   */
  public static generateAncientRuinsPropTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const P = 2;
    const rect = (x: number, y: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(x * P, y * P, w * P, h * P);
    };

    // Plinth (Base)
    rect(2, 34, 20, 6, '#475569');
    rect(4, 32, 16, 3, '#64748b');

    // Fluted Column Shaft
    rect(5, 8, 14, 24, '#94a3b8');
    rect(6, 8, 2, 24, '#cbd5e1'); // Flute 1 highlight
    rect(10, 8, 2, 24, '#cbd5e1'); // Flute 2 highlight
    rect(14, 8, 2, 24, '#cbd5e1'); // Flute 3 highlight
    rect(17, 8, 2, 24, '#64748b'); // Shadow

    // Capital (Top)
    rect(3, 4, 18, 4, '#64748b');
    rect(1, 2, 22, 3, '#94a3b8');

    // Creeping Ivy Vines
    for (let y = 10; y < 34; y += 4) {
      rect(4 + (y % 6), y, 3, 2, '#15803d');
      rect(5 + (y % 6), y + 1, 2, 2, '#22c55e');
    }

    return canvas;
  }

  /**
   * Generates Sky Sunbeam God Ray Texture (120x300)
   * Volumetric golden sun ray to give rich atmosphere to the sky
   */
  public static generateGodRayTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 100, 300);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
    grad.addColorStop(0.5, 'rgba(254, 240, 138, 0.08)');
    grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(50, 0);
    ctx.lineTo(120, 300);
    ctx.lineTo(40, 300);
    ctx.closePath();
    ctx.fill();

    return canvas;
  }

  /**
   * Generates the Power-Up Mystery Gift Box Pickup Texture (32x32)
   */
  public static generatePowerUpBoxTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Golden Box Body
    ctx.fillStyle = '#fea619';
    ctx.beginPath();
    ctx.roundRect(4, 8, 24, 20, 4);
    ctx.fill();

    // Box Highlight Top
    ctx.fillStyle = '#ffddb8';
    ctx.fillRect(6, 10, 20, 3);

    // Cyan Ribbon Vertical & Horizontal
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(14, 8, 4, 20);
    ctx.fillRect(4, 16, 24, 4);

    // Ribbon Bow on Top
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(13, 7, 3, 2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(19, 7, 3, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Glow Glint
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 11, 2, 2);

    return canvas;
  }

  /**
   * Generates the Banana Peel Texture (28x28)
   */
  public static generateBananaTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 28;
    canvas.height = 28;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Banana Yellow Peel
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(14, 4);
    ctx.quadraticCurveTo(6, 12, 4, 22);
    ctx.quadraticCurveTo(14, 18, 24, 22);
    ctx.quadraticCurveTo(22, 12, 14, 4);
    ctx.fill();

    // Banana Stem & Details
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(13, 2, 3, 4);
    ctx.fillRect(4, 21, 2, 2);
    ctx.fillRect(22, 21, 2, 2);

    return canvas;
  }

  /**
   * Generates the Mini Tornado Texture (32x32)
   */
  public static generateTornadoTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Swirling funnels
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.beginPath();
    ctx.ellipse(16, 6, 12, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(16, 13, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(16, 20, 6, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(16, 26, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner White Spin Wisps
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 5, 10, 2);
    ctx.fillRect(12, 12, 7, 2);
    ctx.fillRect(14, 19, 4, 2);

    return canvas;
  }

  /**
   * Generates the Freeze Pop Ice Texture (28x28)
   */
  public static generateFreezePopTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 28;
    canvas.height = 28;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Wooden Stick
    ctx.fillStyle = '#b45309';
    ctx.fillRect(12, 18, 4, 8);

    // Cyan Ice Pop Body
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(8, 4, 12, 16, [6, 6, 2, 2]);
    ctx.fill();

    // Frost Glints
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 3, 10);
    ctx.fillRect(15, 6, 2, 4);

    return canvas;
  }

  /**
   * Generates the Boomerang Texture (28x28)
   */
  public static generateBoomerangTexture(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 28;
    canvas.height = 28;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Curved wood L shape
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(6, 6);
    ctx.lineTo(14, 14);
    ctx.lineTo(22, 6);
    ctx.lineTo(24, 8);
    ctx.lineTo(14, 18);
    ctx.lineTo(4, 8);
    ctx.closePath();
    ctx.fill();

    // Red racing stripes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(8, 7, 3, 3);
    ctx.fillRect(17, 7, 3, 3);

    return canvas;
  }

}
