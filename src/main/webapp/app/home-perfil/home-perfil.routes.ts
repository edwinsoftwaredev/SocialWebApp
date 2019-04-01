import { Route, Resolve } from '@angular/router';
import { HomePerfilComponent } from 'app/home-perfil/home-perfil.component';
import { UserRouteAccessService } from 'app/core';

export const HOME_PERFIL_ROUTE: Route = {
    path: 'home_perfil',
    component: HomePerfilComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Muro'
        // se podria agregar animation: 'homePerfil' pero la pagina esta cargada de cosas por lo que tiene lag la transicion
    },
    canActivate: [UserRouteAccessService]
};
