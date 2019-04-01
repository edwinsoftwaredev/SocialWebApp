import { Injectable } from '@angular/core';
import { Principal } from '../../core/auth/principal.service';
import { AuthServerProvider } from '../../core/auth/auth-jwt.service';

import { SocketService } from '../../shared/socket.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
    constructor(private principal: Principal, private authServerProvider: AuthServerProvider, private socketService: SocketService) {}

    login(credentials, callback?) {
        const cb = callback || function() {};

        return new Promise((resolve, reject) => {
            this.authServerProvider.login(credentials).subscribe(
                data => {
                    this.principal.identity(true).then(account => {
                        resolve(data);
                    });
                    return cb();
                },
                err => {
                    this.logout();
                    reject(err);
                    return cb(err);
                }
            );
        });
    }

    loginWithToken(jwt, rememberMe) {
        return this.authServerProvider.loginWithToken(jwt, rememberMe);
    }

    logout() {
        this.socketService.closeStompSocket(false);
        this.authServerProvider.logout().subscribe();
        this.principal.authenticate(null);
    }
}
