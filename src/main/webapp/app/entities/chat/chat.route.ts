import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Chat } from 'app/shared/model/chat.model';
import { ChatService } from './chat.service';
import { ChatComponent } from './chat.component';
import { ChatDetailComponent } from './chat-detail.component';
import { ChatUpdateComponent } from './chat-update.component';
import { ChatDeletePopupComponent } from './chat-delete-dialog.component';
import { IChat } from 'app/shared/model/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatResolve implements Resolve<IChat> {
    constructor(private service: ChatService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Chat> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<Chat>) => response.ok),
                map((chat: HttpResponse<Chat>) => chat.body)
            );
        }
        return of(new Chat());
    }
}

export const chatRoute: Routes = [
    {
        path: 'chat',
        component: ChatComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Chats'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'chat/:id/view',
        component: ChatDetailComponent,
        resolve: {
            chat: ChatResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Chats'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'chat/new',
        component: ChatUpdateComponent,
        resolve: {
            chat: ChatResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Chats'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'chat/:id/edit',
        component: ChatUpdateComponent,
        resolve: {
            chat: ChatResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Chats'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const chatPopupRoute: Routes = [
    {
        path: 'chat/:id/delete',
        component: ChatDeletePopupComponent,
        resolve: {
            chat: ChatResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Chats'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
