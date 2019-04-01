import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IRelacion } from 'app/shared/model/relacion.model';
import { Principal } from 'app/core';
import { RelacionService } from './relacion.service';

@Component({
    selector: 'jhi-relacion',
    templateUrl: './relacion.component.html'
})
export class RelacionComponent implements OnInit, OnDestroy {
    relacions: IRelacion[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private relacionService: RelacionService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {}

    loadAll() {
        this.relacionService.query().subscribe(
            (res: HttpResponse<IRelacion[]>) => {
                this.relacions = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInRelacions();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IRelacion) {
        return item.id;
    }

    registerChangeInRelacions() {
        this.eventSubscriber = this.eventManager.subscribe('relacionListModification', response => this.loadAll());
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
