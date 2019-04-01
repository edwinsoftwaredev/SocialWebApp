import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { LoginService, StateStorageService } from 'app/core';
import { Router } from '@angular/router';
import { JhiEventManager } from 'ng-jhipster';

@Component({
    selector: 'jhi-new-login',
    templateUrl: 'new-login.component.html',
    styleUrls: ['new-login.component.scss']
})
export class NewLoginComponent implements OnInit {
    authenticationError: boolean;
    password: string;
    username: string;
    rememberMe: boolean;
    credentials: any;
    loadingFlag = false;

    constructor(
        public dialogRef: MatDialogRef<NewLoginComponent>,
        private loginService: LoginService,
        private router: Router,
        private stateStorageService: StateStorageService,
        private eventManager: JhiEventManager,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {}

    login() {
        // console.log('entro');

        this.loadingFlag = true;

        this.loginService
            .login({
                username: this.username,
                password: this.password,
                rememberMe: this.rememberMe
            })
            .then(() => {
                this.authenticationError = false;
                this.dialogRef.close('login success');

                this.loadingFlag = false;

                if (this.router.url === '/register' || /^\/activate\//.test(this.router.url) || /^\/reset\//.test(this.router.url)) {
                    this.router.navigate(['']);
                }

                this.eventManager.broadcast({
                    name: 'authenticationSuccess',
                    content: 'Sending Authentication Success'
                });

                // previousState was set in the authExpiredInterceptor before being redirected to login modal.
                // since login is succesful, go to stored previousState and clear previousState
                const redirect = this.stateStorageService.getUrl();
                if (redirect) {
                    this.stateStorageService.storeUrl(null);
                    this.router.navigate([redirect]);
                }

                /**
                 * La condicion anterior funciona de la siente manera:
                 * suponiendo que el token expiro, respuesta que es dada por el servidor,
                 * const redirect = this.stateStorageService.getUrl(); obtiene la url utilizada antes de que el token
                 * expirara. la condicion evalua si en realidad habia una url anterior o solo es un nuevo inicio de sesion.
                 * si existia una url anterior o un estado anterior a la expiracion del token entonces se cumple la condicion
                 * se elimina el estado anterior o url anterior y se redirige a redirect que era la url anterior.
                 */
            })
            .catch(() => {
                this.loadingFlag = false;
                this.authenticationError = true;
                this.snackBar.open('Intenta ingresar correctamente tus credenciales.', '', {
                    duration: 5000
                });
            });
    }

    register() {
        this.dialogRef.close('to state register');
        this.router.navigate(['/register']);
    }

    requestResetPassword() {
        this.dialogRef.close('to state requestReset');
        this.router.navigate(['/reset', 'request']);
    }

    triggerClick(event) {
        if (event.keyCode === 13) {
            document.getElementById('btnform').click();
        }
    }

    doNothing(event) {
        if (event.keyCode === 13) {
            alert('doNothing');
        }
    }
}
