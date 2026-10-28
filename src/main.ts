import "./styles.css";

const audio = document.querySelector<HTMLAudioElement>("#audio")!;
const urlForm = document.querySelector<HTMLFormElement>("#url-form")!;
const urlInput = document.querySelector<HTMLInputElement>("#audio-url")!;
const fileInput = document.querySelector<HTMLInputElement>("#audio-file")!;
const playButton = document.querySelector<HTMLButtonElement>("#play-button")!;
const stopButton = document.querySelector<HTMLButtonElement>("#stop-button")!;
const seekInput = document.querySelector<HTMLInputElement>("#seek")!;
const volumeInput = document.querySelector<HTMLInputElement>("#volume")!;
const titleElement = document.querySelector<HTMLElement>("#player-title")!;
const sourceDescription = document.querySelector<HTMLElement>("#source-description")!;
const playbackBadge = document.querySelector<HTMLElement>("#playback-badge")!;
const statusMessage = document.querySelector<HTMLElement>("#status-message")!;
const currentTimeElement = document.querySelector<HTMLElement>("#current-time")!;
const durationElement = document.querySelector<HTMLElement>("#duration")!;

let currentObjectUrl: string | null = null;
let isSeeking = false;

function setStatus(message: string, kind: "normal" | "error" = "normal"): void {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", kind === "error");
}

function setBadge(label: string): void {
  playbackBadge.textContent = label;
  playbackBadge.classList.toggle("is-playing", label === "PLAYING");
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  return minutes + ":" + String(remainingSeconds).padStart(2, "0");
}

function isYouTubeUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  return host === "youtu.be"
    || host === "youtube.com"
    || host.endsWith(".youtube.com")
    || host === "youtube-nocookie.com"
    || host.endsWith(".youtube-nocookie.com");
}

function isHttpUrl(url: URL): boolean {
  return url.protocol === "https:" || url.protocol === "http:";
}

function releaseObjectUrl(): void {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function resetTimeline(): void {
  seekInput.value = "0";
  seekInput.disabled = true;
  currentTimeElement.textContent = "0:00";
  durationElement.textContent = "0:00";
}

async function startPlayback(): Promise<void> {
  if (!audio.src) {
    setStatus("Choose an audio file or enter a direct audio URL first.", "error");
    return;
  }

  try {
    await audio.play();
  } catch {
    setStatus("Playback could not start. Check the URL, network connection, and audio format.", "error");
  }
}

function loadSource(source: string, title: string, description: string): void {
  audio.pause();
  audio.src = source;
  audio.load();

  titleElement.textContent = title;
  sourceDescription.textContent = description;
  playButton.disabled = false;
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", "Play");
  setBadge("READY");
  resetTimeline();
}

urlForm.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();
  const rawUrl = urlInput.value.trim();

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    setStatus("Enter a valid URL.", "error");
    return;
  }

  if (!isHttpUrl(parsedUrl)) {
    setStatus("Only HTTP and HTTPS audio URLs are supported.", "error");
    return;
  }

  if (isYouTubeUrl(parsedUrl)) {
    setStatus(
      "YouTube links cannot be converted to hidden audio by this app. Use YouTube's official player, or choose an audio file/direct audio source you have permission to play.",
      "error",
    );
    return;
  }

  releaseObjectUrl();
  let filename = parsedUrl.pathname.split("/").pop() || "Remote audio";
  try {
    filename = decodeURIComponent(filename);
  } catch {
    // Keep the original encoded name if the URL contains malformed escape sequences.
  }
  loadSource(parsedUrl.href, filename, "Direct audio URL");
  await startPlayback();
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  if (file.type && !file.type.startsWith("audio/")) {
    setStatus("Please choose a supported audio file.", "error");
    fileInput.value = "";
    return;
  }

  releaseObjectUrl();
  currentObjectUrl = URL.createObjectURL(file);
  loadSource(currentObjectUrl, file.name, "Local audio file");
  setStatus("Loaded " + file.name);
  await startPlayback();
});

playButton.addEventListener("click", async () => {
  if (audio.paused) {
    await startPlayback();
  } else {
    audio.pause();
  }
});

stopButton.addEventListener("click", () => {
  audio.pause();
  if (audio.src) audio.currentTime = 0;
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", "Play");
  setBadge(audio.src ? "READY" : "IDLE");
  currentTimeElement.textContent = "0:00";
  seekInput.value = "0";
  setStatus("Playback stopped.");
});

volumeInput.addEventListener("input", () => {
  audio.volume = Number(volumeInput.value);
});

seekInput.addEventListener("input", () => {
  isSeeking = true;
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    const ratio = Number(seekInput.value) / 1000;
    currentTimeElement.textContent = formatTime(ratio * audio.duration);
  }
});

seekInput.addEventListener("change", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(seekInput.value) / 1000) * audio.duration;
  }
  isSeeking = false;
});

audio.addEventListener("play", () => {
  playButton.textContent = "Ⅱ";
  playButton.setAttribute("aria-label", "Pause");
  setBadge("PLAYING");
  setStatus("Audio is playing.");
});

audio.addEventListener("pause", () => {
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", "Play");
  if (audio.ended) {
    setBadge("ENDED");
  } else if (audio.src) {
    setBadge("PAUSED");
  } else {
    setBadge("IDLE");
  }
});

audio.addEventListener("loadedmetadata", () => {
  durationElement.textContent = formatTime(audio.duration);
  seekInput.disabled = !Number.isFinite(audio.duration) || audio.duration <= 0;
});

audio.addEventListener("timeupdate", () => {
  if (!isSeeking && Number.isFinite(audio.duration) && audio.duration > 0) {
    seekInput.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    currentTimeElement.textContent = formatTime(audio.currentTime);
  }
});

audio.addEventListener("ended", () => {
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", "Play");
  setBadge("ENDED");
  setStatus("Playback finished.");
});

audio.addEventListener("error", () => {
  if (audio.src) {
    setBadge("ERROR");
    setStatus(
      "This source could not be played. The URL may not point directly to audio, the server may block playback, or the format may be unsupported.",
      "error",
    );
  }
});

audio.volume = Number(volumeInput.value);

window.addEventListener("beforeunload", () => {
  audio.pause();
  releaseObjectUrl();
});
