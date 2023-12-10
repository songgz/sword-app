import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';

import {AppCtxService} from "../services/app-ctx.service";

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const ctx=inject(AppCtxService)
    if(!ctx.authenticated){
        router.navigate(['login']).then();
        return false
    }else{
        return true;
    }
};

