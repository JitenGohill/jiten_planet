export const starVertexShader = `
  attribute float size;
  varying vec3 vColor;

  void main() {
    vColor = color;

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (320.0 / -modelViewPosition.z);
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

export const skyVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    vec2 curve = local * local * (3.0 - 2.0 * local);

    float bottomLeft = hash(cell);
    float bottomRight = hash(cell + vec2(1.0, 0.0));
    float topLeft = hash(cell + vec2(0.0, 1.0));
    float topRight = hash(cell + vec2(1.0, 1.0));

    return mix(
      mix(bottomLeft, bottomRight, curve.x),
      mix(topLeft, topRight, curve.x),
      curve.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int octave = 0; octave < 5; octave++) {
      value += amplitude * noise(point);
      point *= 2.05;
      amplitude *= 0.5;
    }

    return value;
  }

  float ribbon(vec2 uv, float yOffset, float amplitude, float frequency, float thickness) {
    float wave = yOffset
      + sin(uv.x * frequency + uTime * 0.035) * amplitude
      + sin(uv.x * frequency * 1.73 - 1.6 + uTime * 0.021) * amplitude * 0.55;

    return smoothstep(thickness, 0.0, abs(uv.y - wave));
  }

  void main() {
    vec2 uv = vUv;
    vec2 wideUv = vec2(uv.x * 1.65, uv.y);

    vec3 deepNavy = vec3(0.006, 0.004, 0.055);
    vec3 indigo = vec3(0.035, 0.017, 0.18);
    vec3 royalPurple = vec3(0.14, 0.04, 0.46);
    vec3 electricBlue = vec3(0.13, 0.24, 0.95);
    vec3 hotViolet = vec3(0.36, 0.09, 0.86);

    vec3 color = mix(royalPurple, indigo, smoothstep(0.0, 0.58, uv.y));
    color = mix(color, deepNavy, smoothstep(0.48, 1.0, uv.y));

    float lowerGlow = pow(1.0 - uv.y, 2.25);
    color += hotViolet * lowerGlow * 0.56;
    color += electricBlue * lowerGlow * 0.28;

    float leftGlow = smoothstep(0.82, 0.0, distance(uv, vec2(0.0, 0.34)));
    float centerGlow = smoothstep(0.64, 0.0, distance(uv, vec2(0.48, 0.28)));
    float rightGlow = smoothstep(0.72, 0.0, distance(uv, vec2(1.02, 0.38)));
    color += vec3(0.12, 0.20, 0.9) * leftGlow * 0.4;
    color += vec3(0.38, 0.08, 0.9) * centerGlow * 0.3;
    color += vec3(0.24, 0.06, 0.74) * rightGlow * 0.34;

    float cloudNoise = fbm(wideUv * vec2(2.2, 4.4) + vec2(uTime * 0.006, 0.0));
    float ribbonA = ribbon(uv, 0.34, 0.06, 8.2, 0.12);
    float ribbonB = ribbon(uv, 0.48, 0.075, 10.4, 0.105);
    float ribbonC = ribbon(uv, 0.23, 0.04, 12.6, 0.075);
    float nebula = (ribbonA * 0.54 + ribbonB * 0.38 + ribbonC * 0.32) * smoothstep(0.22, 0.78, cloudNoise);
    color += vec3(0.35, 0.12, 0.95) * nebula * 0.42;
    color += vec3(0.15, 0.37, 1.0) * nebula * 0.2;

    float topVignette = smoothstep(0.38, 1.0, uv.y);
    color *= 1.0 - topVignette * 0.2;
    color *= 0.88 + smoothstep(0.0, 0.92, uv.y) * 0.2;

    float edgeVignette = smoothstep(0.92, 0.2, distance(uv, vec2(0.5, 0.54)));
    color *= 0.58 + edgeVignette * 0.52;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const starFragmentShader = `
  uniform float opacity;
  varying vec3 vColor;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(point);

    if (distanceFromCenter > 0.5) {
      discard;
    }

    float core = smoothstep(0.2, 0.0, distanceFromCenter);
    float halo = smoothstep(0.5, 0.0, distanceFromCenter) * 0.45;
    float alpha = max(core, halo) * opacity;

    gl_FragColor = vec4(vColor, alpha);
  }
`;
