// Sun shader implementation based on:
// https://sangillee.com/2024-06-29-create-realistic-sun-with-shaders/
// Uses exact shaders from the article with 3D sphere geometry

import { useEffect, useRef, useState } from "react";

// Generate sphere geometry
function createSphere(radius: number, segments: number) {
  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let lat = 0; lat <= segments; lat++) {
    const theta = (lat * Math.PI) / segments;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= segments; lon++) {
      const phi = (lon * 2 * Math.PI) / segments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      vertices.push(radius * x, radius * y, radius * z);
      normals.push(x, y, z);
    }
  }

  for (let lat = 0; lat < segments; lat++) {
    for (let lon = 0; lon < segments; lon++) {
      const first = lat * (segments + 1) + lon;
      const second = first + segments + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return { vertices, normals, indices };
}

export default function SunBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);
  const isVisibleRef = useRef(true);
  const [showSun, setShowSun] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-color-theme");
      setShowSun(theme === "sun");
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-color-theme", "class"],
    });

    const handleStorageChange = () => {
      checkTheme();
    };
    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(checkTheme, 100);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!showSun) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported or context creation failed");
      return;
    }

    glRef.current = gl;

    // Vertex shader - exact from article
    const vertexShaderSource = `
      attribute vec3 position;
      attribute vec3 normal;
      
      uniform mat4 modelMatrix;
      uniform mat4 viewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      
      varying vec3 vPosition;
      varying vec3 vPositionModel;  // Original model-space position for texture
      varying vec3 vNormal;
      varying vec3 vNormalModel;
      varying vec3 vNormalView;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * worldPosition;
        
        // Use the actual sphere surface position (normalized world position)
        vPosition = normalize(worldPosition.xyz);
        // Keep original model-space position for texture coordinates (doesn't rotate)
        vPositionModel = normalize(position);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vNormalModel = normal;
        vNormalView = normalize(normalMatrix * normal);
        
        gl_Position = projectionMatrix * viewPosition;
      }
    `;

    // Fragment shader - exact from article
    const fragmentShaderSource = `
      precision highp float;
      uniform float u_time;
      varying vec3 vPosition;
      varying vec3 vPositionModel;  // Original model-space position for texture
      varying vec3 vNormal;
      varying vec3 vNormalModel;
      varying vec3 vNormalView;

      float random (in vec3 st) {
            return fract(sin(dot(st,vec3(12.9898,78.233,23.112)))*12943.145);
        }

    float noise (in vec3 _pos) {
        vec3 i_pos = floor(_pos);
        vec3 f_pos = fract(_pos);

        float i_time = floor(u_time*0.2);
        float f_time = fract(u_time*0.2);

        // Four corners in 2D of a tile
        float aa = random(i_pos + i_time);
        float ab = random(i_pos + i_time + vec3(1., 0., 0.));
        float ac = random(i_pos + i_time + vec3(0., 1., 0.));
        float ad = random(i_pos + i_time + vec3(1., 1., 0.));
        float ae = random(i_pos + i_time + vec3(0., 0., 1.));
        float af = random(i_pos + i_time + vec3(1., 0., 1.));
        float ag = random(i_pos + i_time + vec3(0., 1., 1.));
        float ah = random(i_pos + i_time + vec3(1., 1., 1.));

        float ba = random(i_pos + (i_time + 1.));
        float bb = random(i_pos + (i_time + 1.) + vec3(1., 0., 0.));
        float bc = random(i_pos + (i_time + 1.) + vec3(0., 1., 0.));
        float bd = random(i_pos + (i_time + 1.) + vec3(1., 1., 0.));
        float be = random(i_pos + (i_time + 1.) + vec3(0., 0., 1.));
        float bf = random(i_pos + (i_time + 1.) + vec3(1., 0., 1.));
        float bg = random(i_pos + (i_time + 1.) + vec3(0., 1., 1.));
        float bh = random(i_pos + (i_time + 1.) + vec3(1., 1., 1.));

        // Smooth step
        vec3 t = smoothstep(0., 1., f_pos);
        float t_time = smoothstep(0., 1., f_time);

        // Mix 4 corners percentages
        return 
        mix(
            mix(
                mix(mix(aa,ab,t.x), mix(ac,ad,t.x), t.y),
                mix(mix(ae,af,t.x), mix(ag,ah,t.x), t.y), 
            t.z),
            mix(
                mix(mix(ba,bb,t.x), mix(bc,bd,t.x), t.y),
                mix(mix(be,bf,t.x), mix(bg,bh,t.x), t.y), 
            t.z), 
        t_time);
    }



#define NUM_OCTAVES 6
float fBm ( in vec3 _pos, in float sz) {
    float v = 0.0;
    float a = 0.2;
    _pos *= sz;

    vec3 angle = vec3(-0.001*u_time,0.0001*u_time,0.0004*u_time);
    mat3 rotx = mat3(1, 0, 0,
                    0, cos(angle.x), -sin(angle.x),
                    0, sin(angle.x), cos(angle.x));
    mat3 roty = mat3(cos(angle.y), 0, sin(angle.y),
                    0, 1, 0,
                    -sin(angle.y), 0, cos(angle.y));
    mat3 rotz = mat3(cos(angle.z), -sin(angle.z), 0,
                    sin(angle.z), cos(angle.z), 0,
                    0, 0, 1);

    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_pos);
        _pos = rotx * roty * rotz * _pos * 2.0;
        a *= 0.8;
    }
    return v;
}


void main() {
    vec3 st = vPositionModel;

    vec3 q = vec3(0.);
    q.x = fBm( st, 5.);
    q.y = fBm( st + vec3(1.2,3.2,1.52), 5.);
    q.z = fBm( st + vec3(0.02,0.12,0.152), 5.);

    float n = fBm(st+q+vec3(1.82,1.32,1.09), 5.);

    vec3 color = vec3(0.);
    color = mix(vec3(1.,0.4,0.), vec3(1.,1.,1.), n*n);
    color = mix(color, vec3(1.,0.,0.), q*0.7);
    gl_FragColor = vec4(1.6*color, 1.);


    // Glow effect - exact from article
    float raw_intensity = max(dot(vPosition, vNormalView), 0.);
    float intensity = pow(raw_intensity, 4.);
    vec3 u_color = vec3(1.0, 0.8, 0.4);
    vec4 glowColor = vec4(u_color, intensity);

    // Fresnel effect - exact from article
    //float fresnelTerm_inner = 0.2 - 0.7 * min(dot(vPosition, vNormalView), 0.0);
    //fresnelTerm_inner = pow(fresnelTerm_inner, 5.0);
    //float fresnelTerm_outer = 1.0 + dot(normalize(vPosition), normalize(vNormalView));
    //fresnelTerm_outer = pow(fresnelTerm_outer, 2.0);
    //float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer;

    // Combine - exact from article
    //gl_FragColor = vec4(color, 0.7)*fresnelTerm + glowColor;
}
    `;

    // Compile shader
    function createShader(
      gl: WebGLRenderingContext,
      type: number,
      source: string
    ): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    // Create program
    function createProgram(
      gl: WebGLRenderingContext,
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ): WebGLProgram | null {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    }

    // Matrix helpers
    function createIdentityMatrix(): Float32Array {
      return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }

    function createOrthographicMatrix(
      left: number,
      right: number,
      bottom: number,
      top: number,
      near: number,
      far: number
    ): Float32Array {
      return new Float32Array([
        2 / (right - left),
        0,
        0,
        0,
        0,
        2 / (top - bottom),
        0,
        0,
        0,
        0,
        -2 / (far - near),
        0,
        -(right + left) / (right - left),
        -(top + bottom) / (top - bottom),
        -(far + near) / (far - near),
        1,
      ]);
    }

    function createLookAtMatrix(
      eyeX: number,
      eyeY: number,
      eyeZ: number,
      centerX: number,
      centerY: number,
      centerZ: number,
      upX: number,
      upY: number,
      upZ: number
    ): Float32Array {
      const fx = centerX - eyeX;
      const fy = centerY - eyeY;
      const fz = centerZ - eyeZ;
      const len = Math.sqrt(fx * fx + fy * fy + fz * fz);
      const f = [fx / len, fy / len, fz / len];

      const sx = fy * upZ - fz * upY;
      const sy = fz * upX - fx * upZ;
      const sz = fx * upY - fy * upX;
      const lenS = Math.sqrt(sx * sx + sy * sy + sz * sz);
      const s = [sx / lenS, sy / lenS, sz / lenS];

      const ux = s[1] * f[2] - s[2] * f[1];
      const uy = s[2] * f[0] - s[0] * f[2];
      const uz = s[0] * f[1] - s[1] * f[0];

      return new Float32Array([
        s[0],
        ux,
        -f[0],
        0,
        s[1],
        uy,
        -f[1],
        0,
        s[2],
        uz,
        -f[2],
        0,
        -(s[0] * eyeX + s[1] * eyeY + s[2] * eyeZ),
        -(ux * eyeX + uy * eyeY + uz * eyeZ),
        f[0] * eyeX + f[1] * eyeY + f[2] * eyeZ,
        1,
      ]);
    }

    function createNormalMatrix(modelMatrix: Float32Array): Float32Array {
      // Extract upper-left 3x3 from model matrix
      const m00 = modelMatrix[0],
        m01 = modelMatrix[1],
        m02 = modelMatrix[2];
      const m10 = modelMatrix[4],
        m11 = modelMatrix[5],
        m12 = modelMatrix[6];
      const m20 = modelMatrix[8],
        m21 = modelMatrix[9],
        m22 = modelMatrix[10];

      // For rotation matrices, inverse transpose = same matrix
      // Return the 3x3 rotation part
      return new Float32Array([m00, m01, m02, m10, m11, m12, m20, m21, m22]);
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader || !fragmentShader) {
      console.error("Failed to create shaders");
      return;
    }

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      console.error("Failed to create program");
      return;
    }

    programRef.current = program;

    // Create sphere geometry
    const sphere = createSphere(0.6, 32);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(sphere.vertices),
      gl.STATIC_DRAW
    );

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(sphere.normals),
      gl.STATIC_DRAW
    );

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(sphere.indices),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    const normalLocation = gl.getAttribLocation(program, "normal");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const modelMatrixLocation = gl.getUniformLocation(program, "modelMatrix");
    const viewMatrixLocation = gl.getUniformLocation(program, "viewMatrix");
    const projectionMatrixLocation = gl.getUniformLocation(
      program,
      "projectionMatrix"
    );
    const normalMatrixLocation = gl.getUniformLocation(program, "normalMatrix");

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const width = Math.max(rect.width, window.innerWidth);
        const height = Math.max(rect.height, window.innerHeight);
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, canvas.width, canvas.height);
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    setTimeout(resizeCanvas, 100);
    window.addEventListener("resize", resizeCanvas);

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    const handleWindowBlur = () => {
      isVisibleRef.current = false;
    };

    const handleWindowFocus = () => {
      isVisibleRef.current = true;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    isVisibleRef.current = !document.hidden && document.hasFocus();

    const render = () => {
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      if (!gl || !program) return;

      timeRef.current += 0.016;

      gl.useProgram(program);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Set up matrices with aspect ratio correction
      const aspect = canvas.width / canvas.height;

      // Rotate around vertical Y axis through time
      const rotationY = timeRef.current * 0.15;
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      // Rotation matrix around Y axis (vertical)
      const modelMatrix = new Float32Array([
        cosY,
        0,
        sinY,
        0,
        0,
        1,
        0,
        0,
        -sinY,
        0,
        cosY,
        0,
        0,
        0,
        0,
        1,
      ]);

      // Recalculate normal matrix for the rotated model
      const m00 = modelMatrix[0],
        m01 = modelMatrix[1],
        m02 = modelMatrix[2];
      const m10 = modelMatrix[4],
        m11 = modelMatrix[5],
        m12 = modelMatrix[6];
      const m20 = modelMatrix[8],
        m21 = modelMatrix[9],
        m22 = modelMatrix[10];
      const normalMatrix = new Float32Array([
        m00,
        m01,
        m02,
        m10,
        m11,
        m12,
        m20,
        m21,
        m22,
      ]);

      const viewMatrix = createLookAtMatrix(0, 0, 2, 0, 0, 0, 0, 1, 0);

      // Use perspective projection
      const fov = Math.PI / 4;
      const near = 0.1;
      const far = 10;
      const f = 1.0 / Math.tan(fov / 2);
      const range = 1.0 / (near - far);

      const projectionMatrix = new Float32Array([
        f / aspect,
        0,
        0,
        0,
        0,
        f,
        0,
        0,
        0,
        0,
        (near + far) * range,
        -1,
        0,
        0,
        near * far * range * 2,
        0,
      ]);

      // Set uniforms
      if (timeLocation) gl.uniform1f(timeLocation, timeRef.current);
      if (modelMatrixLocation)
        gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
      if (viewMatrixLocation)
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
      if (projectionMatrixLocation)
        gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
      if (normalMatrixLocation)
        gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);

      // Set up attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.enableVertexAttribArray(normalLocation);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(
        gl.TRIANGLES,
        sphere.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (program) {
        gl.deleteProgram(program);
      }
      if (vertexShader) {
        gl.deleteShader(vertexShader);
      }
      if (fragmentShader) {
        gl.deleteShader(fragmentShader);
      }
    };
  }, [showSun, isDark]);

  if (!showSun) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
