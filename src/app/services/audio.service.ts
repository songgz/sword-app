import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  audio: HTMLAudioElement;
  playlist: string[] = [];
  playingIndex = 0;
  playing = new BehaviorSubject<boolean>(false);

  constructor() {
    this.audio = new Audio();
    this.audio.addEventListener('ended', () => {
      this.playNext();
    });
  }

  play(url: string) {
    this.playlist.push(url);
    if (!this.playing.getValue()) {
      this.playNext();
    }
  }

  playNext() {
    if (this.playingIndex < this.playlist.length) {
      const url = this.playlist[this.playingIndex];
      this.audio.src = url;
      this.audio.load();
      this.audio.play();
      this.playing.next(true);
      this.playingIndex++;
    } else {
      this.stop();
    }
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.playlist = [];
    this.playingIndex = 0;
    this.playing.next(false);
  }

}
