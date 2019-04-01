import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IChat } from 'app/shared/model/chat.model';
import { Principal } from 'app/core';
import { ChatService } from './chat.service';

@Component({
    selector: 'jhi-chat',
    templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, OnDestroy {
    chats: IChat[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private chatService: ChatService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {}

    loadAll() {
        this.chatService.query().subscribe(
            (res: HttpResponse<IChat[]>) => {
                this.chats = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInChats();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IChat) {
        return item.id;
    }

    registerChangeInChats() {
        this.eventSubscriber = this.eventManager.subscribe('chatListModification', response => this.loadAll());
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
