import { slideInAnimations } from './../shared/animations';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatDialog, MatDialogRef } from '@angular/material';
import { IUsuario, Usuario } from 'app/shared/model/usuario.model';
import { DomSanitizer } from '@angular/platform-browser';
import { Principal, IUser, Account, LoginService } from 'app/core';
import * as moment from 'moment';
import { FormGroup } from '@angular/forms';
import { UsuarioService } from 'app/entities/usuario';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { NavbarService } from 'app/layouts/navbar/navbar.service';
import { ProfilePanelService } from 'app/profile-panel/profile-panel.service';
import { SocketService } from 'app/shared/socket.service';

@Component({
    selector: 'jhi-profile-details-form',
    templateUrl: './profile-details-form.component.html',
    styleUrls: ['./profile-details-form.component.scss'],
    animations: [slideInAnimations]
})
export class ProfileDetailsFormComponent implements OnInit {
    authenticated: boolean;
    usuarioRegistrado: IUser;
    perfil: IUsuario;
    profilePicUrl = '';

    form: FormGroup;
    usuarioExiste: boolean;

    fechaNacimiento: Date;

    // para compresion de imagenes y cambios de tamaño
    // https://alligator.io/angular/resizing-images-in-browser-ng2-img-max/

    constructor(
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private principal: Principal,
        private dialogLoginRef: MatDialog,
        private usuarioService: UsuarioService,
        private router: Router,
        private ng2ImgService: Ng2ImgMaxService,
        private navbarService: NavbarService,
        private loginService: LoginService,
        private profilePanelService: ProfilePanelService,
        private socketService: SocketService
    ) {}

    ngOnInit() {
        this.perfil = new Usuario();
        this.perfil.profilePic = null;

        setTimeout(() => {
            this.authenticated = this.isAuthenticated();

            if (this.authenticated) {
                this.principal.identity().then((account: Account) => {
                    this.usuarioService.findUsuario(account.login).subscribe(
                        (res: HttpResponse<IUsuario>) => {
                            if (res.body) {
                                this.perfil = res.body;
                                this.profilePicUrl = this.getSanitizedUrlEdit(this.perfil.profilePic, this.perfil.profilePicContentType);

                                if (res.body.actividads) {
                                    this.perfil.actividads = res.body.actividads;
                                } else {
                                    this.perfil.actividads = [];
                                }

                                if (res.body.chats) {
                                    this.perfil.chats = res.body.chats;
                                } else {
                                    this.perfil.chats = [];
                                }

                                if (res.body.posts) {
                                    this.perfil.posts = res.body.posts;
                                } else {
                                    this.perfil.posts = [];
                                }

                                if (res.body.actividads) {
                                    this.perfil.actividads = res.body.actividads;
                                } else {
                                    this.perfil.actividads = [];
                                }

                                this.fechaNacimiento = new Date(this.perfil.fechaNacimiento.format('MM/DD/YYYY'));

                                // console.log(this.fechaNacimiento + ' ' + this.perfil.fechaNacimiento.format('MM/DD/YYYY'));

                                this.usuarioExiste = true;
                            } else {
                                this.perfil.usuario = account.login;
                                this.perfil.email = account.email;
                            }
                        },
                        (err: HttpErrorResponse) => {
                            // *
                        }
                    );

                    this.perfil.usuario = account.login;
                    this.perfil.email = account.email;
                });

                // this.perfil = new Usuario(); // hay que agregar los datos de la pantalla anterior de registro
            } else {
                this.router.navigateByUrl('').then(val => {
                    this.router.navigateByUrl('home_perfil');
                    this.navbarService.closeSideBar();
                });
            }
        }, 200);
    }

    getSanitizedUrlEdit(file: any, fileContentType: string) {
        return this.sanitizer.sanitize(4, 'data:' + fileContentType + ';base64,' + file);
    }

    triggerLoadProfileImage(): void {
        document.getElementById('profileImageInput').click();
    }

    loadProfileImage(event): void {
        //  && event.target.files[0].size < 409600

        if (event.target.files[0].size > 0) {
            let image = event.target.files[0];

            this.ng2ImgService.resizeImage(image, 192, 1000).subscribe(
                result => {
                    image = result;

                    this.ng2ImgService.compressImage(image, 0.05).subscribe(
                        resultCompress => {
                            image = resultCompress;

                            this.perfil.profilePicContentType = event.target.files[0].type;
                            const readerByteArray = new FileReader();
                            readerByteArray.readAsArrayBuffer(image);

                            readerByteArray.onload = () => {
                                const arrayBufferFile: ArrayBuffer = <ArrayBuffer>readerByteArray.result;

                                const array = new Uint8Array(arrayBufferFile);
                                const arrayBytes = Array.from(array);

                                this.perfil.profilePic = arrayBytes;
                            };

                            const readerUrl = new FileReader();
                            readerUrl.readAsDataURL(image);

                            readerUrl.onload = () => {
                                this.profilePicUrl = this.getSanitizedUrl(readerUrl.result);
                            };
                        },
                        error1 => {
                            this.snackBar.open('Intente cargar nuevamente la imagen', '', {
                                duration: 5000
                            });
                            // console.log('Error al comprimir Imagen: ' + error1);
                        }
                    );
                },
                error => {
                    this.snackBar.open('Intente cargar nuevamente la imagen', '', {
                        duration: 5000
                    });
                    // console.log('Error al recortar imagen' + error);
                }
            );
        } else {
            this.snackBar.open('Intente cargar nuevamente la imagen', '', {
                duration: 5000
            });
        }
    }

    getSanitizedUrl(file: any): string {
        return this.sanitizer.sanitize(4, file);
    }

    isAuthenticated(): boolean {
        return this.principal.isAuthenticated();
    }

    saveProfile() {
        if (this.usuarioExiste) {
            this.perfil.fechaNacimiento = moment(this.fechaNacimiento);

            this.usuarioService.update(this.perfil).subscribe((usuario: HttpResponse<IUsuario>) => {
                this.profilePanelService.refreshPanel.next(true);
                this.router.navigateByUrl('home_perfil');
            });
        } else {
            this.perfil.relacions = [];
            this.perfil.posts = [];
            this.perfil.fechaRegistro = moment();
            this.perfil.chats = [];
            this.perfil.actividads = [];
            this.perfil.fechaNacimiento = moment(this.perfil.fechaNacimiento);

            this.usuarioService.create(this.perfil).subscribe((usuario: HttpResponse<IUsuario>) => {
                this.profilePanelService.refreshPanel.next(true);
                this.socketService.initializeWebSocketConnection();

                this.router.navigateByUrl('home_perfil');
            });
        }
    }

    changePassword() {
        this.router.navigate(['/password']);
    }

    deleteProfile() {
        const dialog = this.dialogLoginRef.open(DialogOverviewExampleDialogComponent, {
            width: '350px'
        });

        dialog.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.socketService.closeStompSocket(false);

                this.usuarioService.delete(this.perfil.id).subscribe((res: HttpResponse<any>) => {
                    this.navbarService.closeSideBar();
                    this.loginService.logout();
                    this.router.navigate(['']);
                });
            }
        });
    }

    logout() {
        this.navbarService.closeSideBar();
        this.loginService.logout();
        this.router.navigate(['']);
    }
}

@Component({
    selector: 'jhi-dialog-overview',
    template:
        '<div mat-dialog-content>' +
        '   <h5>¿Deseas eliminar tu perfil?</h5>' +
        '</div>' +
        '<div mat-dialog-actions align="end" style="margin-top: auto;">' +
        '   <button mat-button (click)="onNoClick()">No</button>' +
        '   <button mat-button (click)="acepto()" cdkFocusInitial>Sí</button>' +
        '</div>'
})
export class DialogOverviewExampleDialogComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<DialogOverviewExampleDialogComponent>) {}

    ngOnInit(): void {}

    onNoClick(): void {
        this.dialogRef.close(false);
    }

    acepto(): void {
        this.dialogRef.close(true);
    }
}
