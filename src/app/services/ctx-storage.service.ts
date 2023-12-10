import { Injectable } from '@angular/core';
import {User} from "../models";

const TOKENS_KEY = 'auth-token';
const USER_KEY = 'currentUser';
@Injectable({
  providedIn: 'root'
})
export class CtxStorageService {

  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }

  saveTokens(tokens: any): void {
    //window.sessionStorage.removeItem(TOKENS_KEY);
    window.sessionStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }

  getTokens(): any {
    const tokens = localStorage.getItem(TOKENS_KEY);
    if (tokens) {
      return JSON.parse(tokens);
    }
    return {};
  }

  saveUser(user: User): void {
    //window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): User {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return new User();
  }


}
