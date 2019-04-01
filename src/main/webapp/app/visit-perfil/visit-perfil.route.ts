import { Routes, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { VisitPerfilComponent } from './visit-perfil.component';
import { UserRouteAccessService } from 'app/core';
import { Injectable } from '@angular/core';
import { IUsuario, Usuario } from 'app/shared/model/usuario.model';
import { UsuarioService } from 'app/entities/usuario';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class VisitPerfilResolve implements Resolve<IUsuario> {
    constructor(private service: UsuarioService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Usuario> {
        const usuario = route.params['usuario'] ? route.params['usuario'] : null;
        if (usuario) {
            return this.service.findUsuario(usuario).pipe(
                filter((response: HttpResponse<Usuario>) => response.ok),
                map((usuarioResponse: HttpResponse<Usuario>) => usuarioResponse.body)
            );
        }

        return of(new Usuario());
    }
}

export const visitPerfil: Routes = [
    {
        path: 'profile/:usuario/view',
        component: VisitPerfilComponent,
        resolve: {
            usuario: VisitPerfilResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Social'
        },
        canActivate: [UserRouteAccessService]
    }
];
