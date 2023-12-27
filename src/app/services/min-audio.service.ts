import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MinAudioService {





  audioContext: AudioContext;
  sourceNode: AudioBufferSourceNode | undefined;
  playlist: string[] = [];
  playingIndex = 0;
  playing = new BehaviorSubject<boolean>(false);

  constructor() {
    this.audioContext = new AudioContext();
  }

  async play(url: string) {
    const audioBuffer = await this.loadAudioBuffer(url);
    if (audioBuffer) {
      this.playlist.push(url);
      if (!this.playing.getValue()) {
        await this.playNext();
      }
    }
  }

  async loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    const response = await fetch(url,{
      method: 'GET',
      mode: 'no-cors'
    });
    const arrayBuffer = await response.arrayBuffer();
    return new Promise((resolve, reject) => {
      this.audioContext.decodeAudioData(arrayBuffer, resolve, reject);
    });
  }

  async playNext() {
    if (this.playingIndex < this.playlist.length) {
      const url = this.playlist[this.playingIndex];
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = await this.getAudioBuffer(url);
      this.sourceNode.connect(this.audioContext.destination);
      this.sourceNode.onended = () => {
        this.playNext();
      };
      this.sourceNode.start();
      this.playing.next(true);
      this.playingIndex++;
    } else {
      this.stop();
    }
  }

  async getAudioBuffer(url: string): Promise<AudioBuffer | null> {
    const response = await fetch(url,{
      method: 'GET',
      mode: 'no-cors'
    });
    const arrayBuffer = await response.arrayBuffer();
    return new Promise((resolve, reject) => {
      this.audioContext.decodeAudioData(arrayBuffer, resolve, reject);
    });
  }

  stop() {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = undefined;
    }
    this.playlist = [];
    this.playingIndex = 0;
    this.playing.next(false);
  }

}
