import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Account, LoginService, Principal } from 'app/core';
import { UsuarioService } from 'app/entities/usuario';
import { IUsuario, Usuario } from 'app/shared/model/usuario.model';
import { HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, Event, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NavbarService } from 'app/layouts/navbar/navbar.service';
import { ProfilePanelService } from 'app/profile-panel/profile-panel.service';
import { IRelacion, Relacion } from 'app/shared/model/relacion.model';
import { RelacionService } from 'app/entities/relacion';
import { IPerfil } from 'app/home-perfil/home-perfil.component';
import * as moment from 'moment';

@Component({
    selector: 'jhi-profile-panel',
    templateUrl: './profile-panel.component.html',
    styleUrls: ['./profile-panel.component.scss']
})
export class ProfilePanelComponent implements OnInit {
    usuario: IUsuario = null;
    authenticatedUser: IUsuario = null;
    picUrl: string;
    authenticated = false;

    sonAmigos: boolean;
    usuarioVisitedEnvioSolicitud: boolean;
    usuarioVisitorEnvioSolicitud: boolean;

    relaciones: Array<IRelacion> = [];
    perfilVistado: IPerfil;

    constructor(
        private principal: Principal,
        private usuarioService: UsuarioService,
        private sanitizer: DomSanitizer,
        private router: Router,
        private navbarService: NavbarService,
        private loginService: LoginService,
        private route: ActivatedRoute,
        private profilePanelService: ProfilePanelService,
        private relacionService: RelacionService,
        private changeDetectionRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.getUsuario();
        this.getUserVisited();

        if (!this.route.root.firstChild) {
            this.router.navigate(['/home_perfil']);
            // this.navbarService.closeSideBar();
        }

        this.profilePanelService.refreshPanelObservable.subscribe((val: boolean) => {
            if (val) {
                this.actualizarPanel();
            }
        });
    }

    getUserVisited() {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                if ((this.router.isActive('/home_perfil', true) || this.router.isActive('', true)) && this.usuario !== null) {
                    this.usuario = this.authenticatedUser;
                    this.picUrl = this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType);
                } else {
                    if (this.route.root.firstChild.snapshot.data.usuario) {
                        this.usuario = this.route.root.firstChild.snapshot.data.usuario
                            ? this.route.root.firstChild.snapshot.data.usuario
                            : null;

                        if (this.usuario) {
                            this.loadAll();
                        }

                        this.picUrl = this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType);
                    }
                }
            }
        });
    }

    getUsuario() {
        this.principal.getAuthenticationState().subscribe(val => {
            if (this.principal.isAuthenticated()) {
                this.principal.identity().then((account: Account) => {
                    if (typeof account !== 'undefined') {
                        this.usuarioService.findUsuario(account.login).subscribe((resUsuario: HttpResponse<IUsuario>) => {
                            if (resUsuario.body) {
                                this.authenticated = true;
                                this.authenticatedUser = resUsuario.body;
                                this.usuario = resUsuario.body;
                                this.picUrl = this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType);
                            }
                        });
                    }
                });
            } else {
                this.authenticated = false;
            }
        });
    }

    enviarSolicitudBusqueda(event) {
        event.stopPropagation();

        const usuarioIdRelacion: IUsuario = new Usuario(this.authenticatedUser.id, this.authenticatedUser.usuario);
        const relacionEnvioSolicitud: IRelacion = new Relacion(null, this.usuario.id, false, moment(), usuarioIdRelacion);

        this.relacionService.create(relacionEnvioSolicitud).subscribe((relacionResponse: HttpResponse<IRelacion>) => {
            this.usuarioVisitorEnvioSolicitud = true;
            this.sonAmigos = false;
            this.usuarioVisitedEnvioSolicitud = false;

            this.relaciones.push(relacionResponse.body);
        });
    }

    aceptarSolicitudBusqueda(event) {
        event.stopPropagation();

        const usuarioIdRelacion: IUsuario = new Usuario(this.authenticatedUser.id, this.authenticatedUser.usuario);
        const relacionAceptarSolicitud: IRelacion = new Relacion(null, this.usuario.id, true, moment(), usuarioIdRelacion);

        this.relacionService.create(relacionAceptarSolicitud).subscribe((relacionResponse: HttpResponse<IRelacion>) => {
            this.sonAmigos = true;
            this.usuarioVisitedEnvioSolicitud = false;
            this.usuarioVisitorEnvioSolicitud = false;

            this.relaciones.push(relacionResponse.body);
            this.changeDetectionRef.markForCheck();
        });
    }

    loadAll() {
        this.relacionService.findByUsuario(this.usuario.usuario).subscribe(
            (res: HttpResponse<Array<IRelacion>>) => {
                this.relaciones = res.body;

                const rel: IRelacion = this.relaciones.filter((relacion: IRelacion) => relacion.amigoId === this.authenticatedUser.id)[0];

                if (rel) {
                    if (rel.amigoId === this.authenticatedUser.id && rel.estado === true) {
                        this.sonAmigos = true;
                        this.usuarioVisitedEnvioSolicitud = false;
                        this.usuarioVisitorEnvioSolicitud = false;

                        this.perfilVistado = {
                            firstNameLastName:
                                this.usuario.primerNombre +
                                '' +
                                this.usuario.segundoNombre +
                                '' +
                                this.usuario.primerApellido +
                                '' +
                                this.usuario.segundoApellido,
                            firstNameLastNameSpaced:
                                this.usuario.primerNombre +
                                ' ' +
                                this.usuario.segundoNombre +
                                ' ' +
                                this.usuario.primerApellido +
                                ' ' +
                                this.usuario.segundoApellido,
                            usuario: this.usuario.usuario,
                            amigos: this.sonAmigos,
                            envioSolicitud: this.usuarioVisitedEnvioSolicitud,
                            envieSolicitud: this.usuarioVisitorEnvioSolicitud,
                            profilePicUrlSanitized: this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType),
                            profilePicContentType: this.usuario.profilePicContentType,
                            id: this.usuario.id
                        };
                    } else if (rel.amigoId === this.authenticatedUser.id && rel.estado === false) {
                        this.sonAmigos = false;
                        this.usuarioVisitedEnvioSolicitud = true;
                        this.usuarioVisitorEnvioSolicitud = false;

                        this.perfilVistado = {
                            firstNameLastName:
                                this.usuario.primerNombre +
                                '' +
                                this.usuario.segundoNombre +
                                '' +
                                this.usuario.primerApellido +
                                '' +
                                this.usuario.segundoApellido,
                            firstNameLastNameSpaced:
                                this.usuario.primerNombre +
                                ' ' +
                                this.usuario.segundoNombre +
                                ' ' +
                                this.usuario.primerApellido +
                                ' ' +
                                this.usuario.segundoApellido,
                            usuario: this.usuario.usuario,
                            amigos: this.sonAmigos,
                            envioSolicitud: this.usuarioVisitedEnvioSolicitud,
                            envieSolicitud: this.usuarioVisitorEnvioSolicitud,
                            profilePicUrlSanitized: this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType),
                            profilePicContentType: this.usuario.profilePicContentType,
                            id: this.usuario.id
                        };
                    }
                } else {
                    this.relacionService
                        .findByUsuario(this.authenticatedUser.usuario)
                        .subscribe((responseVisitor: HttpResponse<Array<IRelacion>>) => {
                            const rel2: IRelacion = responseVisitor.body.filter(
                                (relacion: IRelacion) => relacion.amigoId === this.usuario.id
                            )[0];

                            if (rel2) {
                                if (rel2.amigoId === this.usuario.id && rel2.estado === false) {
                                    this.sonAmigos = false;
                                    this.usuarioVisitedEnvioSolicitud = false;
                                    this.usuarioVisitorEnvioSolicitud = true;

                                    this.perfilVistado = {
                                        firstNameLastName:
                                            this.usuario.primerNombre +
                                            '' +
                                            this.usuario.segundoNombre +
                                            '' +
                                            this.usuario.primerApellido +
                                            '' +
                                            this.usuario.segundoApellido,
                                        firstNameLastNameSpaced:
                                            this.usuario.primerNombre +
                                            ' ' +
                                            this.usuario.segundoNombre +
                                            ' ' +
                                            this.usuario.primerApellido +
                                            ' ' +
                                            this.usuario.segundoApellido,
                                        usuario: this.usuario.usuario,
                                        amigos: this.sonAmigos,
                                        envioSolicitud: this.usuarioVisitedEnvioSolicitud,
                                        envieSolicitud: this.usuarioVisitorEnvioSolicitud,
                                        profilePicUrlSanitized: this.getSanitizedUrl(
                                            this.usuario.profilePic,
                                            this.usuario.profilePicContentType
                                        ),
                                        profilePicContentType: this.usuario.profilePicContentType,
                                        id: this.usuario.id
                                    };
                                }
                            } else {
                                this.sonAmigos = false;
                                this.usuarioVisitedEnvioSolicitud = false;
                                this.usuarioVisitorEnvioSolicitud = false;

                                this.perfilVistado = {
                                    firstNameLastName:
                                        this.usuario.primerNombre +
                                        '' +
                                        this.usuario.segundoNombre +
                                        '' +
                                        this.usuario.primerApellido +
                                        '' +
                                        this.usuario.segundoApellido,
                                    firstNameLastNameSpaced:
                                        this.usuario.primerNombre +
                                        ' ' +
                                        this.usuario.segundoNombre +
                                        ' ' +
                                        this.usuario.primerApellido +
                                        ' ' +
                                        this.usuario.segundoApellido,
                                    usuario: this.usuario.usuario,
                                    amigos: this.sonAmigos,
                                    envioSolicitud: this.usuarioVisitedEnvioSolicitud,
                                    envieSolicitud: this.usuarioVisitorEnvioSolicitud,
                                    profilePicUrlSanitized: this.getSanitizedUrl(
                                        this.usuario.profilePic,
                                        this.usuario.profilePicContentType
                                    ),
                                    profilePicContentType: this.usuario.profilePicContentType,
                                    id: this.usuario.id
                                };
                            }
                        });
                }
            },
            error => {
                // *
            },
            () => {
                // *
            }
        );
    }

    actualizarPanel() {
        if (this.principal.isAuthenticated()) {
            this.principal.identity().then((account: Account) => {
                if (typeof account !== 'undefined') {
                    this.usuarioService.findUsuario(account.login).subscribe((resUsuario: HttpResponse<IUsuario>) => {
                        if (resUsuario.body) {
                            this.authenticated = true;
                            this.authenticatedUser = resUsuario.body;
                            this.usuario = resUsuario.body;
                            this.picUrl = this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType);
                        }
                    });
                }
            });
        } else {
            this.authenticated = false;
        }
    }

    getSanitizedUrl(file: any, fileContentType: string) {
        if (file) {
            if (file.toString().charAt(0) === 'd') {
                return this.sanitizer.sanitize(4, file);
            } else {
                return this.sanitizer.sanitize(4, 'data:' + fileContentType + ';base64,' + file);
            }
        }
    }

    editarPerfil() {
        this.router.navigateByUrl('profile-details-form');
    }

    logout() {
        this.navbarService.closeSideBar();
        this.profilePanelService.closeChatPanel.next(true);
        this.loginService.logout();
        this.router.navigate(['']);
    }
}
