"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import type { KeyboardMotion } from "./types";
import { bindKeyboardPointers } from "./pointer-input";
import { keyboardHitArea } from "./keyboard-hit-area";
import {
  KEYBOARD_COLUMNS,
  KEYBOARD_MOBILE_COLUMNS,
  KEYBOARD_STACK,
} from "@/data/keyboard";
import styles from "./keyboard-scene.module.css";

type Props = {
  motion: RefObject<KeyboardMotion>;
  selectedId: string | null;
  pressedId: string | null;
  onSelect: (id: string) => void;
  onPress: (id: string | null) => void;
  onReady: (ready: boolean) => void;
};
type SceneAPI = {
  select: (id: string | null) => void;
  press: (id: string | null) => void;
  reset: () => void;
};
type Key = {
  id: string;
  group: THREE.Group;
  body: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
  targetY: number;
};

async function makeLabel(tool: (typeof KEYBOARD_STACK)[number]) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas labels unavailable");
  let hasLogo = false;
  if (tool.logo) {
    const image = new Image();
    image.src = tool.logo;
    try {
      await image.decode();
      const maxSize = 382;
      const scale = Math.min(
        maxSize / image.naturalWidth,
        maxSize / image.naturalHeight,
      );
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.drawImage(
        image,
        (512 - width) / 2,
        (512 - height) / 2,
        width,
        height,
      );
      hasLogo = true;
    } catch {
      // A single missing logo must not discard the working 3D keyboard.
    }
  }
  if (!hasLogo) {
    // Keep the project name when no logo is available, including pgvector.
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "600 77px Arial, sans-serif";
    context.fillText(tool.name, 256, 256, 440);
  }
  if (tool.name === "Sepolia") {
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.font = "600 42px Arial, sans-serif";
    context.fillText("SEPOLIA", 256, 475);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function KeyboardScene({
  motion,
  selectedId,
  pressedId,
  onSelect,
  onPress,
  onReady,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<SceneAPI | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const scrollMotion = motion.current;
    if (!host) return;
    let disposed = false;
    let contextLost = false;
    let labelsReady = false;
    let reportedReady = false;
    let frame = 0;
    let visible = true;
    let selected: string | null = null;
    let pressed: string | null = null;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      onReady(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute(
      "aria-label",
      `Interactive 3D keyboard with ${KEYBOARD_STACK.length} raised technology keys. Hover or slide to press; drag with a mouse to rotate.`,
    );
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.dataset.geometry = "rounded-solid-keycaps";
    renderer.domElement.dataset.sceneInstance = crypto.randomUUID();
    renderer.domElement.dataset.keyCount = String(KEYBOARD_STACK.length);
    host.appendChild(renderer.domElement);
    // Keep rendering separate from touch hit testing so empty space can scroll.
    const inputSurface = document.createElement("div");
    inputSurface.className = styles.inputSurface;
    inputSurface.dataset.keyboardInput = "";
    inputSurface.setAttribute("aria-hidden", "true");
    host.appendChild(inputSurface);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
    const controls = new OrbitControls(camera, inputSurface);
    controls.enablePan = false;
    controls.enableZoom = false;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    controls.enableDamping = !reduceMotion;
    controls.dampingFactor = 0.14;
    controls.rotateSpeed = 0.55;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.25;
    controls.minAzimuthAngle = -0.8;
    controls.maxAzimuthAngle = 0.8;

    scene.add(new THREE.HemisphereLight(0xe4edff, 0x131721, 1.45));
    const light = new THREE.DirectionalLight(0xffffff, 3.0);
    light.position.set(-6, 14, 8);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.camera.left = light.shadow.camera.bottom = -12;
    light.shadow.camera.right = light.shadow.camera.top = 12;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 40;
    light.shadow.normalBias = 0.025;
    light.shadow.bias = -0.0003;
    light.shadow.radius = 3;
    scene.add(light);
    const rim = new THREE.DirectionalLight(0xb9c9ff, 1.6);
    rim.position.set(8, 5, -10);
    scene.add(rim);

    const model = new THREE.Group();
    scene.add(model);
    const descriptionGroup = new THREE.Group();
    model.add(descriptionGroup);
    let labelFont: Font | null = null;
    let titleMesh: THREE.Mesh | null = null;
    let descriptionMesh: THREE.Mesh | null = null;
    let descriptionTexture: THREE.Texture | null = null;
    const headingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
    });
    const descriptionMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
    });
    const keys: Key[] = [];
    const labelTextures: THREE.Texture[] = [];
    const keyGeometry = new RoundedBoxGeometry(1, 0.8, 1, 5, 0.14);
    const wellGeometry = new RoundedBoxGeometry(1.1, 0.09, 1.1, 2, 0.04);
    const stemGeometry = new THREE.BoxGeometry(0.62, 0.2, 0.62);
    const faceGeometry = new THREE.PlaneGeometry(0.94, 0.94);
    const wellMaterial = new THREE.MeshStandardMaterial({
      color: 0x080c14,
      roughness: 0.8,
    });
    const caseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111318,
      roughness: 0.35,
      metalness: 0.18,
      clearcoat: 0.3,
    });
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0x171a20,
      roughness: 0.45,
      metalness: 0.1,
    });
    let columns = 0;
    let boardWidth = 0;
    let boardDepth = 0;
    const board = new THREE.Group();
    model.add(board);

    const createLayout = () => {
      const nextColumns =
        window.innerWidth < 768 ? KEYBOARD_MOBILE_COLUMNS : KEYBOARD_COLUMNS;
      if (columns === nextColumns) return;
      columns = nextColumns;
      const rows = Math.ceil(KEYBOARD_STACK.length / columns);
      const pitch = 1.2;
      boardWidth = (columns - 1) * pitch + 1.75;
      boardDepth = (rows - 1) * pitch + 1.75;
      descriptionGroup.position.set(
        -boardWidth / 2 + 0.2,
        1,
        -boardDepth / 2 - 1.6,
      );
      while (board.children.length) {
        const child = board.children[0] as THREE.Mesh;
        board.remove(child);
        child.geometry?.dispose();
        if (child.userData.ownsMaterial)
          (child.material as THREE.Material).dispose();
      }
      const base = new THREE.Mesh(
        new RoundedBoxGeometry(boardWidth, 0.52, boardDepth, 4, 0.18),
        caseMaterial,
      );
      base.position.y = -0.19;
      base.castShadow = base.receiveShadow = true;
      board.add(base);
      const plate = new THREE.Mesh(
        new RoundedBoxGeometry(
          boardWidth - 0.14,
          0.13,
          boardDepth - 0.14,
          3,
          0.06,
        ),
        plateMaterial,
      );
      plate.position.y = 0.1;
      plate.receiveShadow = true;
      board.add(plate);
      keys.forEach((key, index) => {
        key.group.position.x = ((index % columns) - (columns - 1) / 2) * pitch;
        key.group.position.z =
          (Math.floor(index / columns) - (rows - 1) / 2) * pitch;
        const well = key.group.userData.well as THREE.Mesh | undefined;
        well?.position.set(key.group.position.x, 0.2, key.group.position.z);
      });
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xc4b5fd }),
      );
      led.position.set(boardWidth / 2 - 0.65, 0.22, -boardDepth / 2 + 0.35);
      led.userData.ownsMaterial = true;
      board.add(led);
    };

    KEYBOARD_STACK.forEach((skill) => {
      const group = new THREE.Group();
      group.position.y = 0.69;
      const material = new THREE.MeshPhysicalMaterial({
        color: skill.color,
        roughness: 0.28,
        metalness: 0.04,
        clearcoat: 0.55,
        clearcoatRoughness: 0.35,
      });
      const body = new THREE.Mesh(keyGeometry, material);
      body.castShadow = body.receiveShadow = true;
      body.userData.skillId = skill.id;
      group.add(body);
      const stem = new THREE.Mesh(stemGeometry, wellMaterial);
      stem.position.y = -0.42;
      group.add(stem);
      model.add(group);
      keys.push({ id: skill.id, group, body, targetY: 0.69 });
    });

    let viewportAspect = 1;
    const updateDescription = () => {
      const tool = KEYBOARD_STACK.find((tool) => tool.id === selected);
      const name = tool?.name || "Tech Stack";
      const description =
        tool?.description || "Hover a key to discover how I use it.";
      const dark = document.documentElement.classList.contains("dark");
      const ink = dark ? "#f6f5f1" : "#142238";
      headingMaterial.color.set(ink);
      if (titleMesh) {
        descriptionGroup.remove(titleMesh);
        titleMesh.geometry.dispose();
        titleMesh = null;
      }
      if (labelFont) {
        const geometry = new TextGeometry(name, {
          font: labelFont,
          size: 0.72,
          depth: 0.09,
          curveSegments: 4,
          bevelEnabled: true,
          bevelThickness: 0.008,
          bevelSize: 0.006,
          bevelSegments: 2,
        });
        geometry.computeBoundingBox();
        titleMesh = new THREE.Mesh(geometry, headingMaterial);
        const width = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
        titleMesh.scale.setScalar(Math.min(1, (boardWidth - 0.5) / width));
        titleMesh.rotation.x = -Math.PI / 2;
        titleMesh.castShadow = true;
        descriptionGroup.add(titleMesh);
        renderer.domElement.dataset.descriptionGeometry = "extruded-text";
      }
      const canvas = document.createElement("canvas");
      canvas.width = 1536;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = ink;
        context.font = "60px Arial, sans-serif";
        context.textBaseline = "top";
        const lines: string[] = [""];
        for (const word of description.split(" ")) {
          const index = lines.length - 1;
          const line = `${lines[index]} ${word}`.trim();
          if (context.measureText(line).width > 1480) lines.push(word);
          else lines[index] = line;
        }
        lines
          .slice(0, 3)
          .forEach((line, index) => context.fillText(line, 5, 12 + index * 78));
        descriptionTexture?.dispose();
        descriptionTexture = new THREE.CanvasTexture(canvas);
        descriptionTexture.colorSpace = THREE.SRGBColorSpace;
        descriptionMaterial.map = descriptionTexture;
        descriptionMaterial.needsUpdate = true;
        if (!descriptionMesh) {
          descriptionMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(boardWidth - 0.4, 1.3),
            descriptionMaterial,
          );
          descriptionMesh.rotation.x = -Math.PI / 2;
          descriptionMesh.position.set((boardWidth - 0.4) / 2, 0.01, 0.85);
          descriptionGroup.add(descriptionMesh);
        }
      }
      renderer.domElement.dataset.description = name;
      invalidate();
    };
    // Keep every key inside the viewport, including when the board is rotated.
    const frameModel = () => {
      camera.updateMatrixWorld();
      model.updateMatrixWorld(true);
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      const corner = new THREE.Vector3();
      for (const x of [-boardWidth / 2, boardWidth / 2])
        for (const y of [-0.5, 1.1 + motion.current.explode * 2.5])
          for (const z of [
            -boardDepth / 2 - (descriptionGroup.visible ? 2.5 : 0),
            boardDepth / 2,
          ]) {
            corner
              .set(x, y, z)
              .applyMatrix4(model.matrixWorld)
              .applyMatrix4(camera.matrixWorldInverse);
            minX = Math.min(minX, corner.x);
            maxX = Math.max(maxX, corner.x);
            minY = Math.min(minY, corner.y);
            maxY = Math.max(maxY, corner.y);
          }
      const size =
        Math.max((maxY - minY) / 2, (maxX - minX) / 2 / viewportAspect) * 1.08;
      const centerX = (minX + maxX) / 2,
        centerY = (minY + maxY) / 2;
      camera.left = centerX - size * viewportAspect;
      camera.right = centerX + size * viewportAspect;
      camera.top = centerY + size;
      camera.bottom = centerY - size;
      camera.updateProjectionMatrix();
    };
    const tick = () => {
      frame = 0;
      if (disposed || contextLost || (!visible && reportedReady)) return;
      let moving = false;
      const scrollPose = motion.current;
      model.rotation.set(...scrollPose.rotation);
      descriptionGroup.visible = scrollPose.showDescription;
      const lift = reduceMotion ? 0 : scrollPose.explode;
      for (const [index, key] of keys.entries()) {
        const targetY =
          key.targetY +
          lift *
            (1.3 + Math.sin(performance.now() * 0.0014 + index * 0.65) * 0.55);
        key.group.position.y = THREE.MathUtils.lerp(
          key.group.position.y,
          targetY,
          reduceMotion ? 1 : 0.24,
        );
        moving ||= lift > 0 || Math.abs(key.group.position.y - targetY) > 0.001;
      }
      const orbiting = controls.update();
      frameModel();
      if (window.innerWidth < 768)
        inputSurface.style.setProperty(
          "--keyboard-hit-area",
          keyboardHitArea(
            boardWidth,
            boardDepth,
            1.1 + lift * 2.5,
            model.matrixWorld,
            camera,
          ),
        );
      renderer.render(scene, camera);
      // Only hand off from the intro once the textured keyboard has actually painted.
      if (labelsReady && !reportedReady) {
        reportedReady = true;
        onReady(true);
      }
      renderer.domElement.dataset.rotation = model.rotation
        .toArray()
        .slice(0, 3)
        .map((value) => Number(value).toFixed(3))
        .join(",");
      if (moving || orbiting) invalidate();
    };
    const invalidate = () => {
      // Prepare one complete frame even below the fold so mobile loading can finish.
      if (!frame && !disposed && (visible || !reportedReady))
        frame = requestAnimationFrame(tick);
    };
    scrollMotion.invalidate = invalidate;
    const setTargets = () => {
      keys.forEach((key) => {
        key.targetY = pressed === key.id ? 0.5 : 0.69;
        key.body.material.emissive.set(
          selected === key.id ? 0x292342 : 0x000000,
        );
        key.body.material.emissiveIntensity = 0.2;
      });
      renderer.domElement.dataset.selectedKey = selected || "";
      renderer.domElement.dataset.pressedKey = pressed || "";
      invalidate();
    };

    const fitCamera = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      createLayout();
      renderer.setSize(width, height, false);
      viewportAspect = width / height;
      const target = new THREE.Vector3(0, 0.25, 0);
      const mobile = window.innerWidth < 768;
      camera.position
        .set(mobile ? 0.5 : 5.5, mobile ? 16 : 12, mobile ? 10 : 16)
        .normalize()
        .multiplyScalar(24)
        .add(target);
      camera.lookAt(target);
      frameModel();
      controls.target.copy(target);
      controls.update();
      controls.saveState();
      invalidate();
    };
    api.current = {
      select: (id) => {
        if (selected !== id) {
          selected = id;
          updateDescription();
        }
        selected = id;
        setTargets();
      },
      press: (id) => {
        pressed = id;
        setTargets();
      },
      reset: () => {
        fitCamera();
        controls.reset();
        invalidate();
      },
    };
    controls.addEventListener("change", invalidate);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hitKey = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(
        keys.map((key) => key.body),
        false,
      )[0]?.object.userData.skillId as string | undefined;
    };
    const unbindPointers = bindKeyboardPointers({
      target: inputSurface,
      hitTest: (event) => hitKey(event) || null,
      onKeyChange: (id) => {
        pressed = id;
        if (id) {
          selected = id;
          onSelect(id);
          updateDescription();
        }
        onPress(id);
        setTargets();
      },
      onTouchChange: (active) => {
        controls.enabled = !active;
      },
    });
    const lost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      reportedReady = false;
      cancelAnimationFrame(frame);
      frame = 0;
      onReady(false);
    };
    const restored = () => {
      contextLost = false;
      invalidate();
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    renderer.domElement.addEventListener("webglcontextrestored", restored);

    const resize = new ResizeObserver(fitCamera);
    resize.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) invalidate();
      else if (reportedReady) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    intersection.observe(host);
    fitCamera();
    updateDescription();
    const themeObserver = new MutationObserver(updateDescription);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const fontAbort = new AbortController();
    void fetch("/assets/fonts/helvetiker-bold.typeface.json", {
      signal: fontAbort.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Typeface unavailable");
        return response.json();
      })
      .then((data) => {
        if (!disposed) {
          labelFont = new FontLoader().parse(data);
          updateDescription();
        }
      })
      .catch(() => {
        /* The accessible text description remains available. */
      });
    // Key wells are fixed to the deck while their caps travel vertically.
    keys.forEach((key) => {
      const well = new THREE.Mesh(wellGeometry, wellMaterial);
      well.position.set(key.group.position.x, 0.2, key.group.position.z);
      well.receiveShadow = true;
      key.group.userData.well = well;
      model.add(well);
    });
    void Promise.all(
      KEYBOARD_STACK.map(async (skill, index) => {
        const texture = await makeLabel(skill);
        if (disposed) {
          texture.dispose();
          return;
        }
        labelTextures.push(texture);
        const face = new THREE.Mesh(
          faceGeometry,
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1,
          }),
        );
        face.rotation.x = -Math.PI / 2;
        face.position.y = 0.405;
        keys[index].group.add(face);
        invalidate();
      }),
    )
      .then(() => {
        if (!disposed) {
          labelsReady = true;
          invalidate();
        }
      })
      .catch(() => {
        if (!disposed) onReady(false);
      });

    return () => {
      disposed = true;
      fontAbort.abort();
      themeObserver.disconnect();
      descriptionTexture?.dispose();
      headingMaterial.dispose();
      descriptionMaterial.dispose();
      scrollMotion.invalidate = undefined;
      api.current = null;
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      unbindPointers();
      controls.removeEventListener("change", invalidate);
      controls.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      renderer.domElement.removeEventListener("webglcontextrestored", restored);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      labelTextures.forEach((texture) => texture.dispose());
      light.shadow.map?.dispose();
      renderer.dispose();
      inputSurface.remove();
      renderer.domElement.remove();
    };
  }, [motion, onSelect, onPress, onReady]);

  useEffect(() => {
    api.current?.select(selectedId);
  }, [selectedId]);
  useEffect(() => {
    api.current?.press(pressedId);
  }, [pressedId]);

  return (
    <div className={styles.viewport}>
      <div ref={hostRef} className={styles.canvasHost} />
      <button
        type="button"
        className={styles.reset}
        onClick={() => api.current?.reset()}
        aria-label="Reset 3D keyboard view"
      >
        ↺ Reset view
      </button>
    </div>
  );
}
