"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  KEYBOARD_COLUMNS,
  KEYBOARD_MOBILE_COLUMNS,
  KEYBOARD_STACK,
} from "@/data/keyboard";
import styles from "./tech-keyboard.module.css";
import type { KeyboardMotion } from "./types";
import { usePreloader } from "../preloader/context";
import { bindKeyboardPointers } from "./pointer-input";
const KeyboardScene = dynamic(() => import("./keyboard-scene"), { ssr: false });

export default function TechKeyboard({
  motion,
}: {
  motion: RefObject<KeyboardMotion>;
}) {
  const { canInitializeScene, registerScene } = usePreloader();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [sceneStatus, setSceneStatus] = useState<
    "loading" | "ready" | "failed"
  >("loading");
  const sceneReady = sceneStatus === "ready";
  const completeScene = useRef<(() => void) | null>(null);
  useEffect(() => {
    const complete = registerScene();
    completeScene.current = complete;
    return () => {
      complete();
      completeScene.current = null;
    };
  }, [registerScene]);
  const handleSceneReady = useCallback((ready: boolean) => {
    setSceneStatus(ready ? "ready" : "failed");
    completeScene.current?.();
  }, []);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  const currentPress = useRef<string | null>(null);
  const pressAudio = useRef<HTMLAudioElement>(null);
  const releaseAudio = useRef<HTMLAudioElement>(null);
  const handlePress = useCallback((id: string | null) => {
    if (currentPress.current === id) return;
    const hadPress = currentPress.current !== null;
    currentPress.current = id;
    setPressedId(id);
    if (!soundEnabledRef.current || (!id && !hadPress)) return;
    const audio = id ? pressAudio.current : releaseAudio.current;
    if (id && hadPress && releaseAudio.current) {
      releaseAudio.current.volume = 0.3;
      releaseAudio.current.currentTime = 0;
      void releaseAudio.current.play().catch(() => {});
    }
    if (audio) {
      audio.volume = id ? 0.45 : 0.3;
      audio.currentTime = 0;
      void audio.play().catch(() => {
        /* Sound may be disabled by the browser. */
      });
    }
  }, []);
  useEffect(() => {
    const press = pressAudio.current;
    const release = releaseAudio.current;
    const cancel = () => handlePress(null);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("blur", cancel);
      press?.pause();
      release?.pause();
    };
  }, [handlePress]);
  const keysRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = keysRef.current;
    if (!target || sceneStatus !== "failed") return;
    return bindKeyboardPointers({
      target,
      hitTest: (event) => {
        const key = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest<HTMLElement>("[data-key-id]");
        return key && target.contains(key) ? key.dataset.keyId || null : null;
      },
      onKeyChange: (id) => {
        if (id) setSelectedId(id);
        handlePress(id);
      },
    });
  }, [sceneStatus, handlePress]);
  const selected = KEYBOARD_STACK.find((skill) => skill.id === selectedId);

  return (
    <div
      className={`${styles.stage} ${styles.full}`}
      style={
        {
          "--key-columns": KEYBOARD_COLUMNS,
          "--mobile-key-columns": KEYBOARD_MOBILE_COLUMNS,
        } as CSSProperties
      }
      data-columns={KEYBOARD_COLUMNS}
      data-mobile-columns={KEYBOARD_MOBILE_COLUMNS}
      data-tech-keyboard="shared"
      data-stack-count={KEYBOARD_STACK.length}
      data-renderer={
        sceneReady ? "webgl" : sceneStatus === "failed" ? "fallback" : "loading"
      }
    >
      <audio
        ref={pressAudio}
        src="/assets/keycap-sounds/press.mp3"
        preload="auto"
        data-keyboard-audio="press"
      />
      <audio
        ref={releaseAudio}
        src="/assets/keycap-sounds/release.mp3"
        preload="auto"
        data-keyboard-audio="release"
      />
      <button
        type="button"
        className={styles.soundToggle}
        aria-label={
          soundEnabled ? "Mute keyboard sounds" : "Enable keyboard sounds"
        }
        aria-pressed={soundEnabled}
        onClick={() => {
          const next = !soundEnabledRef.current;
          soundEnabledRef.current = next;
          setSoundEnabled(next);
          if (!next) {
            pressAudio.current?.pause();
            releaseAudio.current?.pause();
          }
        }}
      >
        {soundEnabled ? "♪ Sound on" : "♪ Sound off"}
      </button>
      {sceneStatus === "loading" && (
        <div className={styles.scenePlaceholder} role="status">
          <span>Preparing the 3D keyboard…</span>
        </div>
      )}
      <div className={sceneReady ? styles.liveScene : styles.loadingScene}>
        {canInitializeScene && (
          <KeyboardScene
            motion={motion}
            selectedId={selectedId}
            pressedId={pressedId}
            onSelect={setSelectedId}
            onPress={handlePress}
            onReady={handleSceneReady}
          />
        )}
      </div>
      <div
        className={`${styles.perspective} ${sceneStatus !== "failed" ? styles.accessibleKeys : ""}`}
      >
        <div className={styles.board}>
          <div className={styles.topBar}>
            <span className={styles.brand}>
              <span className={styles.brandMark}>SST</span> ENGINEERING TOOLKIT
            </span>
            <span className={styles.counter}>
              <i aria-hidden="true" /> {KEYBOARD_STACK.length} KEYS
            </span>
          </div>
          <div
            ref={keysRef}
            className={styles.keys}
            role="group"
            aria-label={`Explore all ${KEYBOARD_STACK.length} technologies and tools`}
          >
            {KEYBOARD_STACK.map((skill) => {
              return (
                <button
                  key={skill.id}
                  type="button"
                  className={styles.key}
                  style={{ "--key-color": skill.color } as CSSProperties}
                  aria-label={skill.name}
                  aria-pressed={selectedId === skill.id}
                  title={`${skill.name} · ${skill.group}`}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "mouse") return;
                    setSelectedId(skill.id);
                    handlePress(skill.id);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "mouse") handlePress(null);
                  }}
                  onFocus={() => setSelectedId(skill.id)}
                  onClick={() => setSelectedId(skill.id)}
                  onPointerDown={(event) => {
                    if (event.pointerType === "mouse" && event.button === 0)
                      handlePress(skill.id);
                  }}
                  onKeyDown={(event) => {
                    if (
                      !event.repeat &&
                      (event.key === " " || event.key === "Enter")
                    )
                      handlePress(skill.id);
                  }}
                  onKeyUp={() => handlePress(null)}
                  onBlur={() => handlePress(null)}
                  data-tech-key={skill.name}
                  data-key-id={skill.id}
                  data-pressed={pressedId === skill.id}
                >
                  <span className={styles.keyIcon} aria-hidden="true">
                    {skill.logo ? (
                      <Image
                        src={skill.logo}
                        width={64}
                        height={64}
                        alt=""
                        loading="eager"
                        unoptimized
                      />
                    ) : (
                      <span className={styles.wordmark}>pgvector</span>
                    )}
                  </span>
                  <span className={styles.keyLabel}>{skill.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className={
          sceneStatus !== "failed" ? styles.accessibleKeys : styles.inspector
        }
        aria-live="polite"
        aria-atomic="true"
      >
        {selected ? (
          <>
            <span className={styles.selectedName}>{selected.name}</span>
            <span className={styles.selectedDescription}>
              {selected.description}
            </span>
          </>
        ) : (
          <>
            <span className={styles.selectedName}>
              {KEYBOARD_STACK.length} technologies. One toolkit.
            </span>
            <span className={styles.selectedDescription}>
              {sceneReady
                ? "Hover or slide across keys. Use a mouse to rotate."
                : "Hover, slide, tap, or focus a key to explore."}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
