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
import {
  KEYBOARD_COLUMNS,
  KEYBOARD_MOBILE_COLUMNS,
  KEYBOARD_STACK,
} from "@/data/keyboard";
import styles from "./tech-keyboard.module.css";
import type { KeyboardMotion } from "./types";
import { usePreloader } from "../preloader/context";
import { bindKeyboardPointers } from "./pointer-input";
import { createKeyboardSound } from "./keyboard-sound";
type SceneComponent = typeof import("./keyboard-scene").default;

export default function TechKeyboard({
  motion,
  onSettled,
}: {
  motion: RefObject<KeyboardMotion>;
  onSettled: () => void;
}) {
  const { isLoading } = usePreloader();
  const [KeyboardScene, setKeyboardScene] = useState<SceneComponent | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [sceneStatus, setSceneStatus] = useState<
    "loading" | "ready" | "failed"
  >("loading");
  const sceneReady = sceneStatus === "ready";
  const handleSceneReady = useCallback(
    (ready: boolean) => {
      setSceneStatus(ready ? "ready" : "failed");
      onSettled();
    },
    [onSettled],
  );
  useEffect(() => {
    let active = true;
    // Fetch the optional chunk during the intro; defer GPU work until it exits.
    void import("./keyboard-scene")
      .then((module) => {
        if (active) setKeyboardScene(() => module.default);
      })
      .catch(() => {
        if (active) handleSceneReady(false);
      });
    return () => {
      active = false;
    };
  }, [handleSceneReady]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const soundEnabledRef = useRef(true);
  const soundRef = useRef<ReturnType<typeof createKeyboardSound> | null>(null);
  const handlePress = useCallback((id: string | null) => {
    setPressedId(id);
    soundRef.current?.press(id);
  }, []);
  useEffect(() => {
    const sound = createKeyboardSound(
      new AudioContext({ latencyHint: "interactive" }),
      setAudioReady,
    );
    sound.setEnabled(soundEnabledRef.current);
    soundRef.current = sound;
    const unlock = (event: Event) => {
      if (!event.isTrusted) return;
      // The toggle handles its own gesture so its first click enables sound.
      if (
        event.target instanceof Element &&
        event.target.closest("[data-keyboard-sound-toggle]")
      )
        return;
      sound.unlock();
    };
    const cancel = () => handlePress(null);
    const events = ["pointerdown", "pointerup", "click", "keydown"];
    events.forEach((event) => document.addEventListener(event, unlock, true));
    window.addEventListener("blur", cancel);
    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, unlock, true),
      );
      window.removeEventListener("blur", cancel);
      soundRef.current = null;
      sound.dispose();
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
      data-audio-state={
        !soundEnabled ? "muted" : audioReady ? "ready" : "locked"
      }
      data-renderer={
        sceneReady ? "webgl" : sceneStatus === "failed" ? "fallback" : "loading"
      }
    >
      <button
        type="button"
        className={styles.soundToggle}
        data-keyboard-sound-toggle
        aria-label={
          soundEnabled && audioReady
            ? "Mute keyboard sounds"
            : "Enable keyboard sounds"
        }
        aria-pressed={soundEnabled && audioReady}
        onClick={() => {
          const next = !soundEnabledRef.current || !audioReady;
          soundEnabledRef.current = next;
          setSoundEnabled(next);
          soundRef.current?.setEnabled(next);
          if (next) soundRef.current?.unlock();
        }}
      >
        {soundEnabled
          ? audioReady
            ? "♪ Sound on"
            : "♪ Enable sound"
          : "♪ Sound off"}
      </button>
      <div className={sceneReady ? styles.liveScene : styles.loadingScene}>
        {!isLoading && KeyboardScene && (
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
                      sceneStatus === "failed" ? (
                        <Image
                          src={skill.logo}
                          width={64}
                          height={64}
                          alt=""
                          loading="eager"
                          unoptimized
                        />
                      ) : null
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
