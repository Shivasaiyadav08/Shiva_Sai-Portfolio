type Sound = "press" | "release";

const files: Record<Sound, string> = {
  press: "/assets/keycap-sounds/press.mp3",
  release: "/assets/keycap-sounds/release.mp3",
};

// One unlocked context plays both samples, including rapid slides between keys.
export function createKeyboardSound(
  context: AudioContext,
  onReady: (ready: boolean) => void,
  load: (url: string) => Promise<ArrayBuffer> = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load keyboard sound: ${url}`);
    return response.arrayBuffer();
  },
) {
  let enabled = true;
  let disposed = false;
  let activeKey: string | null = null;
  let version = 0;
  let scheduledVersion = -1;
  let loaded = false;
  let resuming: Promise<void> | null = null;
  const buffers = {} as Record<Sound, AudioBuffer>;
  const voices = new Set<AudioBufferSourceNode>();
  const reportReady = () => {
    if (!disposed) onReady(loaded && context.state === "running");
  };
  context.addEventListener("statechange", reportReady);
  const ready = Promise.all(
    (Object.keys(files) as Sound[]).map(async (sound) => {
      buffers[sound] = await context.decodeAudioData(await load(files[sound]));
    }),
  ).then(() => {
    loaded = true;
    reportReady();
  });
  void ready.catch(reportReady);

  const play = (sounds: Sound[], request: number) => {
    // Never queue blocked hover sounds for playback after a later interaction.
    if (disposed || !enabled || (context.state !== "running" && !resuming))
      return;
    scheduledVersion = request;
    void Promise.all([ready, resuming])
      .then(() => {
        if (
          disposed ||
          !enabled ||
          request !== version ||
          context.state !== "running"
        )
          return;
        for (const sound of sounds) {
          const source = context.createBufferSource();
          const gain = context.createGain();
          source.buffer = buffers[sound];
          gain.gain.value = sound === "press" ? 0.45 : 0.3;
          source.connect(gain).connect(context.destination);
          voices.add(source);
          source.onended = () => {
            voices.delete(source);
            source.disconnect();
            gain.disconnect();
          };
          source.start();
        }
      })
      .catch(reportReady)
      .finally(() => {
        if (scheduledVersion === request) scheduledVersion = -1;
      });
  };
  const stop = () => {
    version++;
    voices.forEach((source) => source.stop());
    voices.clear();
  };
  return {
    unlock() {
      if (disposed || !enabled || context.state === "running") return;
      const request = version;
      // Call resume synchronously inside the trusted click/tap/keydown handler.
      resuming = context
        .resume()
        .then(() => {
          reportReady();
          // A hover may already have selected this key before the first click.
          if (activeKey && request === version && scheduledVersion !== request)
            play(["press"], request);
        })
        .catch(reportReady)
        .finally(() => {
          resuming = null;
        });
    },
    press(id: string | null) {
      if (id === activeKey) return;
      const hadPress = activeKey !== null;
      activeKey = id;
      const sounds: Sound[] = [];
      if (hadPress) sounds.push("release");
      if (id) sounds.push("press");
      play(sounds, ++version);
    },
    setEnabled(next: boolean) {
      enabled = next;
      if (!next) stop();
    },
    dispose() {
      disposed = true;
      stop();
      context.removeEventListener("statechange", reportReady);
      void context.close().catch(() => {});
    },
  };
}
