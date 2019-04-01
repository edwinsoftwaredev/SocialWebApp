import { DialogPosition, MatDialog } from '@angular/material';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, Event, ActivatedRoute } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { VERSION } from 'app/app.constants';
import { Account } from '../../core/user/account.model';
import { Principal } from '../../core/auth/principal.service';
import { LoginService } from '../../core/login/login.service';
import { ProfileService } from '../profiles/profile.service';
import { NewLoginComponent } from 'app/shared/new-login/new-login.component';
import { NavbarService } from 'app/layouts/navbar/navbar.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { UsuarioService } from '../../entities/usuario/usuario.service';
import { IUsuario } from 'app/shared/model/usuario.model';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchBarComponent } from 'app/search-bar/search-bar.component';

@Component({
    selector: 'jhi-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['navbar.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
    inProduction: boolean;
    isNavbarCollapsed: boolean;
    languages: any[];
    swaggerEnabled: boolean;
    modalRef: NgbModalRef;
    version: string;
    enMuro: boolean;
    sideBarFlag = false;
    estadoRightPanel = false;
    mobileQuery: MediaQueryList = null;
    private _mobileMediaQueryListener: () => void;
    private entroPrimeraVezSideBarFlag = false;
    usuario: IUsuario = null;

    constructor(
        private loginService: LoginService,
        private principal: Principal,
        private profileService: ProfileService,
        private router: Router,
        public activeRouter: ActivatedRoute,
        public newLoginModal: MatDialog,
        private navbarService: NavbarService,
        private mediaMatcher: MediaMatcher,
        private media: MediaMatcher,
        private usuarioService: UsuarioService,
        private changeDetectorRef: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        private dialogSearchBar: MatDialog
    ) {
        this.version = VERSION ? 'v' + VERSION : '';
        this.isNavbarCollapsed = true;

        setTimeout(() => {
            this.mobileQuery = this.media.matchMedia('(max-width: 1000px)');
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
            this._mobileMediaQueryListener = () => this.changeDetectorRef.detectChanges();
            this.mobileQuery.addEventListener(typeof this._mobileMediaQueryListener, this._mobileMediaQueryListener);
        }, 200);
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeEventListener(typeof this._mobileMediaQueryListener, this._mobileMediaQueryListener);
    }

    ngOnInit() {
        if (this.principal.isAuthenticated()) {
            this.principal.identity().then((account: Account) => {
                this.usuarioService.findUsuario(account.login).subscribe((res: HttpResponse<IUsuario>) => {
                    this.usuario = res.body;
                });
            });
        }

        this.profileService.getProfileInfo().then(profileInfo => {
            this.inProduction = profileInfo.inProduction;
            this.swaggerEnabled = profileInfo.swaggerEnabled;
        });

        if (this.router.isActive('/home_perfil', true)) {
            this.enMuro = true;
        }

        // depues de llenar el formulario de social de registro
        // cuando se envia a muro el usuario se tiene que cargar en este componente el usuario
        // lo que ayuda a mostrar el boton de menu
        this.navbarService.refreshUsuarioObservable.subscribe((val: boolean) => {
            if (this.usuario === null) {
                this.principal.identity().then((account: Account) => {
                    this.usuarioService.findUsuario(account.login).subscribe((res: HttpResponse<IUsuario>) => {
                        if (res.body) {
                            this.usuario = res.body;
                            this.changeDetectorRef.markForCheck();
                        }
                    });
                });
            }
        });

        this.principal.getAuthenticationState().subscribe((account: Account) => {
            if (account && this.router.isActive('', true)) {
                this.usuarioService.findUsuario(account.login).subscribe(
                    (usuarioRes: HttpResponse<IUsuario>) => {
                        if (usuarioRes) {
                            this.usuario = usuarioRes.body;
                            this.changeDetectorRef.markForCheck();
                        }
                    },
                    (err: HttpErrorResponse) => {
                        // *
                    }
                );
            } else {
                this.usuario = null;
            }
        });

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                if (event.urlAfterRedirects.trim() === '/home_perfil') {
                    this.enMuro = true;
                    this.estadoRightPanel = false;

                    if (!this.entroPrimeraVezSideBarFlag) {
                        this.entroPrimeraVezSideBarFlag = true;
                        // this.sideBarFlag = true;
                        // this.openSideBar(true);
                    }
                } else {
                    if (this.activeRouter.root.firstChild.snapshot.data.usuario) {
                        this.enMuro = true;
                        this.estadoRightPanel = false;
                    } else {
                        this.enMuro = false;
                    }
                }
            }
        });
    }

    crearPost() {
        this.navbarService.crearPost();
    }

    collapseNavbar() {
        this.isNavbarCollapsed = true;
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        // this.modalRef = this.loginModalService.open(); -> antiguo login bootstrap

        const newLoginRef = this.newLoginModal.open(NewLoginComponent, {
            width: '25%',
            minWidth: '350px'
        });
    }

    logout() {
        this.collapseNavbar();
        this.loginService.logout();
        this.router.navigate(['']);
    }

    toggleNavbar() {
        this.isNavbarCollapsed = !this.isNavbarCollapsed;
    }

    getImageUrl() {
        return this.isAuthenticated() ? this.principal.getImageUrl() : null;
    }

    openSideBar(abierto: boolean) {
        this.sideBarFlag = abierto;
        this.navbarService.openSideBar(abierto);
    }

    changeStatusRightPanel(status: boolean) {
        this.estadoRightPanel = status;
        this.navbarService.rightPanelStatus(status);
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

    openSearchBar() {
        this.dialogSearchBar.open(SearchBarComponent, {
            position: { top: '80px' },
            width: '50%',
            maxWidth: '100%',
            height: '60px',
            maxHeight: '80px',
            panelClass: 'searchDialog'
        });
    }
}
