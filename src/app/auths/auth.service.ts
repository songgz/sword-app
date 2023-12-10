import { Injectable } from '@angular/core';
import {map, Observable} from 'rxjs';
import {RestApiService} from "../services/rest-api.service";
import {AppCtxService} from "../services/app-ctx.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private rest: RestApiService, private ctx: AppCtxService) { }

  login(username: string, password: string): Observable<any> {
    return this.rest.post('auths/sign_in', {username: username, password: password}).pipe(map(res => {
      this.ctx.saveToken(res.tokens);
      this.ctx.saveUser(res.data);

      return res;
    }));
  }
}
