import { Injectable } from '@angular/core';
import {User} from "../models";

const TOKENS_KEY = 'auth-token';
const USER_KEY = 'currentUser';
const USERS_KEY = 'users';
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

  getUsers() {
    let users = [];
    const v = window.localStorage.getItem(USERS_KEY);
    if (v) {
      users = JSON.parse(v);
    }
    return users;
  }

  addUser(userId: string, userName: string, userAcctNo: string, password: string, avatar: string) {
    let users = this.getUsers();
    if (!users.find((u:any) => u.id === userId)){
      users.push({id: userId, name: userName, acct_no: userAcctNo, password: password, avatar: avatar});
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  removeUser(index: number) {
    let users = this.getUsers();
    if (users.length > 0) {
      users.splice(index, 1);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  saveUsers(users: any) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }




}
