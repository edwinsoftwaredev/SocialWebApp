import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { ILike } from 'app/shared/model/like.model';
import { Principal } from 'app/core';
import { LikeService } from './like.service';

@Component({
    selector: 'jhi-like',
    templateUrl: './like.component.html'
})
export class LikeComponent implements OnInit, OnDestroy {
    likes: ILike[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private likeService: LikeService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {}

    loadAll() {
        this.likeService.query().subscribe(
            (res: HttpResponse<ILike[]>) => {
                this.likes = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInLikes();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: ILike) {
        return item.id;
    }

    registerChangeInLikes() {
        this.eventSubscriber = this.eventManager.subscribe('likeListModification', response => this.loadAll());
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
