import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { FilePost } from 'app/shared/model/file-post.model';
import { FilePostService } from './file-post.service';
import { FilePostComponent } from './file-post.component';
import { FilePostDetailComponent } from './file-post-detail.component';
import { FilePostUpdateComponent } from './file-post-update.component';
import { FilePostDeletePopupComponent } from './file-post-delete-dialog.component';
import { IFilePost } from 'app/shared/model/file-post.model';

@Injectable({ providedIn: 'root' })
export class FilePostResolve implements Resolve<IFilePost> {
    constructor(private service: FilePostService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FilePost> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<FilePost>) => response.ok),
                map((filePost: HttpResponse<FilePost>) => filePost.body)
            );
        }
        return of(new FilePost());
    }
}

export const filePostRoute: Routes = [
    {
        path: 'file-post',
        component: FilePostComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FilePosts'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'file-post/:id/view',
        component: FilePostDetailComponent,
        resolve: {
            filePost: FilePostResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FilePosts'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'file-post/new',
        component: FilePostUpdateComponent,
        resolve: {
            filePost: FilePostResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FilePosts'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'file-post/:id/edit',
        component: FilePostUpdateComponent,
        resolve: {
            filePost: FilePostResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FilePosts'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const filePostPopupRoute: Routes = [
    {
        path: 'file-post/:id/delete',
        component: FilePostDeletePopupComponent,
        resolve: {
            filePost: FilePostResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'FilePosts'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
