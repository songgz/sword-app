import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {User} from "../models";
import {CtxStorageService} from "./ctx-storage.service";

@Injectable({
  providedIn: 'root'
})
export class AppCtxService {
  learnType: string = 'read';
  authenticated: boolean = false;
  userSubject: BehaviorSubject<User>;
  user: Observable<User>;
  learnTypes: any = {read: '认读', listen: '辨音', spell: '拼写'};
  bookId: string = '';

  constructor(private storage: CtxStorageService) {
    this.userSubject = new BehaviorSubject(this.storage.getUser());
    this.user = this.userSubject.asObservable();
  }

  saveUser(user: User){
    this.storage.saveUser(user);
    this.userSubject?.next(user);
    this.authenticated = true;
  }

  getUser(): User {
      return this.userSubject.value || new User();
  }

  getUserId(): string {
    return this.getUser().id || '';
  }

  getUserVipDays(): number {
    return this.getUser().vip_days || 0;
  }

  getUserName(): string {
    return this.getUser().name || '';
  }

  saveToken(token: string){
    this.storage.saveTokens(token);

  }

  getToken(): string | null {
    return this.storage.getTokens();

  }

  addUser(userId: string, userName: string, userAcctNo: string, password: string, avatar: string) {
    this.storage.addUser(userId, userName, userAcctNo, password, avatar);
  }

  logout() {
    this.storage.signOut();
    this.userSubject.next(new User());
  }


}
