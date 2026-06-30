class AudioManager {
  private audioElement: HTMLAudioElement | null = null;

  initialize(): HTMLAudioElement | null {
    if (this.audioElement) return this.audioElement;

    if (typeof window !== "undefined") {
      this.audioElement = new Audio();
      return this.audioElement;
    }

    return null;
  }

  getAudio(): HTMLAudioElement | null {
    return this.audioElement;
  }

  getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }

  getDuration(): number {
    return this.audioElement?.duration || 0;
  }

  getProgress(): number {
    if (!this.audioElement || !this.audioElement.duration) return 0;
    return (this.audioElement.currentTime / this.audioElement.duration) * 100;
  }

  setAudioSource(url: string): void {
    if (this.audioElement) {
      this.audioElement.src = url;
      this.audioElement.load();
    }
  }

  resetSource(): void {
    if (this.audioElement) {
      this.audioElement.removeAttribute("src");
      this.audioElement.load();
    }
  }

  waitForCanPlay(timeoutMs: number = 5000): Promise<void> {
    const el = this.audioElement;
    if (!el) return Promise.reject(new Error("No audio element"));

    if (el.readyState >= 2) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        el.removeEventListener("canplay", onCanPlay);
        el.removeEventListener("error", onError);
        reject(new Error("Audio load timeout"));
      }, timeoutMs);

      const onCanPlay = () => {
        clearTimeout(timeout);
        el.removeEventListener("canplay", onCanPlay);
        el.removeEventListener("error", onError);
        resolve();
      };

      const onError = () => {
        clearTimeout(timeout);
        el.removeEventListener("canplay", onCanPlay);
        el.removeEventListener("error", onError);
        const mediaError = el.error;
        const msg = mediaError
          ? `Audio error code=${mediaError.code}: ${mediaError.message}`
          : "Unknown audio error";
        reject(new Error(msg));
      };

      el.addEventListener("canplay", onCanPlay);
      el.addEventListener("error", onError);
    });
  }

  play(): Promise<void> | undefined {
    return this.audioElement?.play();
  }

  pause(): void {
    return this.audioElement?.pause();
  }

  seek(percent: number): void {
    if (this.audioElement && this.audioElement.duration) {
      this.audioElement.currentTime = (percent / 100) * this.audioElement.duration;
    }
  }

  skipForward(seconds: number = 10): void {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.min(
        this.audioElement.duration || 0,
        this.audioElement.currentTime + seconds,
      );
    }
  }

  skipBackward(seconds: number = 10): void {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(
        0,
        this.audioElement.currentTime - seconds,
      );
    }
  }
}

export const audioManager = new AudioManager();
