import { Component, OnInit } from '@angular/core';

import { Principal } from 'app/core';
import { PasswordService } from './password.service';
import { MatSnackBar } from '@angular/material';

@Component({
    selector: 'jhi-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
    doNotMatch: string;
    account: any;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    success1: boolean;

    error: string;
    success: string;

    constructor(private passwordService: PasswordService, private principal: Principal, private snackBar: MatSnackBar) {}

    ngOnInit() {
        this.success1 = false;
        this.principal.identity().then(account => {
            this.account = account;
        });
    }

    changePassword() {
        if (this.newPassword !== this.confirmPassword) {
            this.doNotMatch = 'ERROR';
            this.snackBar.open('La nueva contraseña y su confirmación no coinciden!');
        } else {
            this.doNotMatch = null;
            this.passwordService.save(this.newPassword, this.currentPassword).subscribe(
                () => {
                    this.success1 = true;
                    this.snackBar.open('Se ha cambiado el contraseña.', '', {
                        duration: 4000
                    });
                },
                () => {
                    this.success1 = false;
                    this.snackBar.open('Hubo un error al cambiar la contraseña...', '', {
                        duration: 4000
                    });
                }
            );
        }
    }
}
