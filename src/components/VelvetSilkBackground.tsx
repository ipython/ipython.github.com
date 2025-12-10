import { useEffect, useRef, useState } from "react";

export default function VelvetSilkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);
  const isVisibleRef = useRef(true);
  const [showSilk, setShowSilk] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [hue, setHue] = useState(350);
  const [saturation, setSaturation] = useState(1.0);
  const [brightness, setBrightness] = useState(8.0);
  const [speed, setSpeed] = useState(0.5);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-color-theme");
      setShowSilk(theme === "velvet");
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    // Check initial theme
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-color-theme", "class"],
    });

    // Also check localStorage changes
    const handleStorageChange = () => {
      checkTheme();
    };
    window.addEventListener("storage", handleStorageChange);

    // Poll for changes (fallback)
    const interval = setInterval(checkTheme, 100);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!showSilk) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported or context creation failed");
      return;
    }

    glRef.current = gl;
    console.log(
      "WebGL context created, canvas size:",
      canvas.width,
      "x",
      canvas.height
    );

    // Vertex shader source
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_uv = (a_position + 1.0) * 0.5;
        v_uv.y = 1.0 - v_uv.y; // Flip Y
      }
    `;

    // Fragment shader source - exact from ShaderToy example
    const fragmentShaderSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_hue;
      uniform float u_saturation;
      uniform float u_brightness;
      uniform float u_speed;
      varying vec2 v_uv;

      float noise(vec2 p) {
        return 0.1*smoothstep(-0.5, 0.9, sin((p.x - p.y) * 555.0) * sin(p.y * 1444.0)) - 0.4;
      }

      float fabric(vec2 p) {
        const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        float f = 0.4 * noise(p);
        f += 0.3 * noise(p = m * p);
        f += 0.2 * noise(p = m * p);
        return f + 0.1 * noise(m * p);
      }

      float silk(vec2 uv, float t) {
        float s = sin(5.0 * (uv.x + uv.y + cos(2.0 * uv.x + 5.0 * uv.y)) + sin(12.0 * (uv.x + uv.y)) - t);
        s = 0.7 + 0.3 * (s * s * 0.5 + s);
        s *= 0.9 + 0.6 * fabric(uv * min(u_resolution.x, u_resolution.y) * 0.0006);
        return s * 0.9 + 0.1;
      }

      float silkd(vec2 uv, float t) {
        float xy = uv.x + uv.y;
        float d = (5.0 * (1.0 - 2.0 * sin(2.0 * uv.x + 5.0 * uv.y)) + 12.0 * cos(12.0 * xy)) * cos(5.0 * (cos(2.0 * uv.x + 5.0 * uv.y) + xy) + sin(12.0 * xy) - t);
        return 0.005 * d * (sign(d) + 3.0);
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        float mr = min(u_resolution.x, u_resolution.y);
        vec2 uv = v_uv * u_resolution / mr;

        float t = u_time * u_speed;
        uv.y += 0.03 * sin(8.0 * uv.x - t);

        float s = sqrt(silk(uv, t));
        float d = silkd(uv, t);

        vec3 c = vec3(s);
        c += 0.7 * vec3(1.0, 0.83, 0.6) * d;
        c *= 1.0 - max(0.0, 0.8 * d);
        
        // INVERT is 1, so use inverted path
        c = 0.5+pow(c, vec3(0.3) / vec3(0.52, 0.5, 0.4))/2.0;
        c = 1.0 - c;

        // Apply HSV color adjustment
        vec3 hsv = vec3(u_hue / 360.0, u_saturation, u_brightness);
        vec3 targetColor = hsv2rgb(hsv);
        c = mix(c, c * targetColor, 0.5);
        
        gl_FragColor = vec4(c, 1.0);
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

    console.log("Shader program created successfully");

    programRef.current = program;

    // Setup geometry (full screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const hueLocation = gl.getUniformLocation(program, "u_hue");
    const saturationLocation = gl.getUniformLocation(program, "u_saturation");
    const brightnessLocation = gl.getUniformLocation(program, "u_brightness");
    const speedLocation = gl.getUniformLocation(program, "u_speed");

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const width = Math.max(rect.width, window.innerWidth);
        const height = Math.max(rect.height, window.innerHeight);
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, canvas.width, canvas.height);
        console.log("Canvas resized to:", canvas.width, "x", canvas.height);
      } else {
        // Fallback to window size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        console.log(
          "Canvas resized to window size:",
          canvas.width,
          "x",
          canvas.height
        );
      }
    };

    // Initial resize
    resizeCanvas();

    // Also resize after a short delay to ensure parent is sized
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

      timeRef.current += 0.016; // ~60fps

      gl.useProgram(program);

      // Clear with a test color first to verify rendering works
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Set attributes
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Set uniforms - using velvet theme colors
      if (timeLocation) gl.uniform1f(timeLocation, timeRef.current);
      if (resolutionLocation)
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      if (hueLocation) gl.uniform1f(hueLocation, hue);
      if (saturationLocation) gl.uniform1f(saturationLocation, saturation);
      if (brightnessLocation) gl.uniform1f(brightnessLocation, brightness);
      if (speedLocation) gl.uniform1f(speedLocation, speed);

      // Check for WebGL errors
      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        console.error("WebGL error before draw:", error);
      }

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Check for errors after draw
      const errorAfter = gl.getError();
      if (errorAfter !== gl.NO_ERROR) {
        console.error("WebGL error after draw:", errorAfter);
      }

      if (timeRef.current < 0.1) {
        console.log(
          "First frame rendered, time:",
          timeRef.current,
          "resolution:",
          canvas.width,
          "x",
          canvas.height
        );
      }

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
  }, [showSilk, isDark]);

  if (!showSilk) {
    if (typeof document !== "undefined") {
      console.log(
        "VelvetSilkBackground: showSilk is false, theme:",
        document.documentElement.getAttribute("data-color-theme")
      );
    }
    return null;
  }

  if (typeof document !== "undefined") {
    console.log("VelvetSilkBackground: Rendering canvas, isDark:", isDark);
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ backgroundColor: "#000000" }}
    />
  );
}
