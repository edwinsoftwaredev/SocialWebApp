import { Component, OnInit } from '@angular/core';
import { NewLoginComponent } from 'app/shared/new-login/new-login.component';
import { Register } from '../register/register.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/shared';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { LoginService } from 'app/core';

@Component({
    selector: 'jhi-new-register',
    templateUrl: './new-register.component.html',
    styleUrls: ['./new-register.component.scss']
})
export class NewRegisterComponent implements OnInit {
    confirmPassword: string;
    doNotMatch: string;
    error: string;
    errorEmailExists: string;
    errorUserExists: string;
    registerAccount: any;
    success: boolean;

    constructor(
        private newLoginModalRef: MatDialog,
        private registrerServicer: Register,
        private snackBar: MatSnackBar,
        private router: Router,
        private loginService: LoginService
    ) {}

    ngOnInit() {
        this.success = false;
        this.registerAccount = {};
    }

    register() {
        if (this.registerAccount.password !== this.confirmPassword) {
            this.doNotMatch = 'ERROR';
            this.snackBar.open('La contraseña y su confirmación no coinciden!');
        } else {
            this.doNotMatch = null;
            this.error = null;
            this.errorUserExists = null;
            this.errorEmailExists = null;
            this.registerAccount.langkey = 'en';
            this.registrerServicer.save(this.registerAccount).subscribe(
                () => {
                    this.success = true;

                    const credentials: any = {
                        username: this.registerAccount.login,
                        password: this.registerAccount.password,
                        rememberMe: false
                    };

                    this.loginService
                        .login(credentials)
                        .then(
                            () => {
                                this.router.navigateByUrl('profile-details-form');
                            },
                            (reason: any) => {
                                this.loginService.logout();
                            }
                        )
                        .catch((reason: any) => {
                            // console.log(reason);
                            this.snackBar.open('Error en iniciando sesión. Intenta iniciar sesión.', '', {
                                duration: 5000
                            });
                        });

                    this.snackBar.open('Te has registrado a Social. Completa tu Perfil.', '', {
                        duration: 5000
                    });
                },
                errorResponse => this.processError(errorResponse)
            );
        }
    }

    openLogin() {
        this.newLoginModalRef.open(NewLoginComponent, {
            width: '25%',
            minWidth: '350px'
        });
    }

    private processError(errorResponse: HttpErrorResponse) {
        this.success = null;
        if (errorResponse.status === 400 && errorResponse.error.type === LOGIN_ALREADY_USED_TYPE) {
            this.errorUserExists = 'ERROR';
            this.snackBar.open('Nombre de usuario ya existe! Por favor elige otro', '', {
                duration: 5000
            });
        } else if (errorResponse.status === 400 && errorResponse.error.type === EMAIL_ALREADY_USED_TYPE) {
            this.errorEmailExists = 'ERROR';
            this.snackBar.open('Email ya se encuentra en uso! Por favor proporciona otro.', '', {
                duration: 5000
            });
        } else {
            this.error = 'ERROR';
            this.snackBar.open('Hubo error en el registro. Por favor intenta luego.', '', {
                duration: 5000
            });
        }
    }
}
