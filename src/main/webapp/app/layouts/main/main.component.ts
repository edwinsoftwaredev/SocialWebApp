import { slideInAnimations } from './../../shared/animations';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd, RouterOutlet } from '@angular/router';

import { Title } from '@angular/platform-browser';
import { MatDrawer } from '@angular/material';
import { NavbarService } from 'app/layouts/navbar/navbar.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { Principal } from 'app/core';
import { ProfilePanelService } from 'app/profile-panel/profile-panel.service';

@Component({
    selector: 'jhi-main',
    templateUrl: './main.component.html',
    animations: [slideInAnimations]
})
export class JhiMainComponent implements OnInit, OnDestroy {
    // para el side nav hay que validar que existe un usuario para social
    @ViewChild('sidenav')
    sidenav: MatDrawer;
    mobileQuery: MediaQueryList = null;
    authenticated = false;
    private _mobileMediaQueryListener: () => void;
    sidebarAbierto = false;
    sideBarAbiertoPrimeraVez = false;

    constructor(
        private titleService: Title,
        private router: Router,
        private navbarService: NavbarService,
        private media: MediaMatcher,
        private changeDetectorRed: ChangeDetectorRef,
        private principal: Principal,
        private profilePanelService: ProfilePanelService
    ) {
        setTimeout(() => {
            this.mobileQuery = this.media.matchMedia('(max-width: 1000px)');
            this.changeDetectorRed.markForCheck();
            this.changeDetectorRed.detectChanges();

            // este codigo sirve para tomar los eventos que se producen cuando no son del boton
            // (se hace click a fuera del panel)
            this.sidenav.closedStart.subscribe(() => {
                this.sidebarAbierto = false;
            });

            this.sidenav.close();

            this.profilePanelService.refreshPanel.next(true);

            this._mobileMediaQueryListener = () => this.changeDetectorRed.detectChanges();
            this.mobileQuery.addEventListener(typeof this._mobileMediaQueryListener, this._mobileMediaQueryListener);
        }, 200);
    }

    private getPageTitle(routeSnapshot: ActivatedRouteSnapshot) {
        let title: string = routeSnapshot.data && routeSnapshot.data['pageTitle'] ? routeSnapshot.data['pageTitle'] : 'socialProjectApp';
        if (routeSnapshot.firstChild) {
            title = this.getPageTitle(routeSnapshot.firstChild) || title;
        }
        return title;
    }

    ngOnInit() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.titleService.setTitle(this.getPageTitle(this.router.routerState.snapshot.root));
            }
        });

        this.navbarService.forceCloseSideNavObservable.subscribe(val => {
            if (this.sidenav) {
                this.sidenav.close();
            }
        });

        // este codigo sirve para tomar los eventos que se producen cuando no son del boton (se hace click a fuera del panel)
        /*this.sidenav.closedStart.subscribe(() => {
            this.sidebarAbierto = false;
        });*/

        // esta codigo sirve para tomar solo lo eventos que produce el boton de menu
        this.navbarService.sideBarOpenClickObservable.subscribe((abierto: boolean) => {
            // el valor que se obtiene del observable es solo para validar que se hizo click

            if (this.sidenav) {
                if (this.sidebarAbierto) {
                    this.sidenav.close();
                    this.sidebarAbierto = false;
                } else {
                    this.sidenav.open();
                    this.sidebarAbierto = true;
                }
            }
        });

        this.principal.getAuthenticationState().subscribe((val: boolean) => {
            if (this.principal.isAuthenticated()) {
                this.authenticated = true;
            }
        });
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeEventListener(typeof this._mobileMediaQueryListener, this._mobileMediaQueryListener);
    }

    prepareRoute(outlet: RouterOutlet) {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    }
}
