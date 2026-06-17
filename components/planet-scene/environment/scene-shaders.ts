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
  varying vec3 vSkyDirection;

  void main() {
    vSkyDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyFragmentShader = `
  uniform float uTime;
  varying vec3 vSkyDirection;

  float hash(vec3 point) {
    return fract(sin(dot(point, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  float noise(vec3 point) {
    vec3 cell = floor(point);
    vec3 local = fract(point);
    vec3 curve = local * local * (3.0 - 2.0 * local);

    float frontBottomLeft = hash(cell);
    float frontBottomRight = hash(cell + vec3(1.0, 0.0, 0.0));
    float frontTopLeft = hash(cell + vec3(0.0, 1.0, 0.0));
    float frontTopRight = hash(cell + vec3(1.0, 1.0, 0.0));
    float backBottomLeft = hash(cell + vec3(0.0, 0.0, 1.0));
    float backBottomRight = hash(cell + vec3(1.0, 0.0, 1.0));
    float backTopLeft = hash(cell + vec3(0.0, 1.0, 1.0));
    float backTopRight = hash(cell + vec3(1.0, 1.0, 1.0));

    float front = mix(
      mix(frontBottomLeft, frontBottomRight, curve.x),
      mix(frontTopLeft, frontTopRight, curve.x),
      curve.y
    );
    float back = mix(
      mix(backBottomLeft, backBottomRight, curve.x),
      mix(backTopLeft, backTopRight, curve.x),
      curve.y
    );

    return mix(front, back, curve.z);
  }

  float fbm(vec3 point) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int octave = 0; octave < 5; octave++) {
      value += amplitude * noise(point);
      point *= 2.05;
      amplitude *= 0.5;
    }

    return value;
  }

  float directionalGlow(vec3 direction, vec3 center, float spread) {
    return smoothstep(spread, 1.0, dot(direction, normalize(center)));
  }

  void main() {
    vec3 direction = normalize(vSkyDirection);
    float vertical = clamp(direction.y * 0.5 + 0.5, 0.0, 1.0);

    vec3 deepNavy = vec3(0.006, 0.004, 0.055);
    vec3 lowIndigo = vec3(0.018, 0.010, 0.095);
    vec3 horizonViolet = vec3(0.070, 0.040, 0.340);
    vec3 electricBlue = vec3(0.060, 0.120, 0.520);
    vec3 hotViolet = vec3(0.160, 0.040, 0.420);

    vec3 color = mix(lowIndigo, horizonViolet, smoothstep(0.02, 0.52, vertical));
    color = mix(color, deepNavy, smoothstep(0.52, 1.0, vertical));

    float horizonLift = pow(1.0 - abs(direction.y), 2.8);
    color += electricBlue * horizonLift * 0.08;
    color += hotViolet * pow(max(0.0, 1.0 - vertical), 2.2) * 0.05;

    float blueGlow = directionalGlow(direction, vec3(-0.86, -0.18, -0.36), 0.38);
    float violetGlow = directionalGlow(direction, vec3(0.22, -0.08, -0.98), 0.44);
    float distantGlow = directionalGlow(direction, vec3(0.82, 0.04, -0.48), 0.5);
    color += vec3(0.080, 0.160, 0.720) * blueGlow * 0.14;
    color += vec3(0.220, 0.060, 0.680) * violetGlow * 0.10;
    color += vec3(0.100, 0.220, 0.760) * distantGlow * 0.08;

    float cloudNoise = fbm(direction * 3.2 + vec3(uTime * 0.008, uTime * 0.003, -uTime * 0.006));
    float bandWave = sin(dot(direction, vec3(3.3, 0.6, -2.4)) + uTime * 0.025) * 0.08
      + sin(dot(direction, vec3(-1.5, 1.2, 3.7)) - uTime * 0.018) * 0.05;
    float nebulaBand = smoothstep(0.22, 0.0, abs(direction.y + 0.1 + bandWave));
    float nebula = nebulaBand * smoothstep(0.34, 0.82, cloudNoise);
    color += vec3(0.200, 0.070, 0.720) * nebula * 0.09;
    color += vec3(0.060, 0.240, 0.780) * nebula * 0.05;

    float dimPocket = directionalGlow(direction, vec3(-0.98, -0.06, 0.16), 0.66);
    color = mix(color, deepNavy, dimPocket * 0.36);

    float grain = fbm(direction * 22.0 + vec3(0.0, uTime * 0.01, 4.0));
    color = mix(color, deepNavy, 0.12);
    color *= 0.90 + grain * 0.04;

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
