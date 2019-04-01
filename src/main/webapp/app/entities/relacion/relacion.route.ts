import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Relacion } from 'app/shared/model/relacion.model';
import { RelacionService } from './relacion.service';
import { RelacionComponent } from './relacion.component';
import { RelacionDetailComponent } from './relacion-detail.component';
import { RelacionUpdateComponent } from './relacion-update.component';
import { RelacionDeletePopupComponent } from './relacion-delete-dialog.component';
import { IRelacion } from 'app/shared/model/relacion.model';

@Injectable({ providedIn: 'root' })
export class RelacionResolve implements Resolve<IRelacion> {
    constructor(private service: RelacionService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Relacion> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<Relacion>) => response.ok),
                map((relacion: HttpResponse<Relacion>) => relacion.body)
            );
        }
        return of(new Relacion());
    }
}

export const relacionRoute: Routes = [
    {
        path: 'relacion',
        component: RelacionComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Relacions'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'relacion/:id/view',
        component: RelacionDetailComponent,
        resolve: {
            relacion: RelacionResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Relacions'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'relacion/new',
        component: RelacionUpdateComponent,
        resolve: {
            relacion: RelacionResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Relacions'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'relacion/:id/edit',
        component: RelacionUpdateComponent,
        resolve: {
            relacion: RelacionResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Relacions'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const relacionPopupRoute: Routes = [
    {
        path: 'relacion/:id/delete',
        component: RelacionDeletePopupComponent,
        resolve: {
            relacion: RelacionResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Relacions'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
