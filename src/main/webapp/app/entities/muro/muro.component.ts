import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IMuro } from 'app/shared/model/muro.model';
import { Principal } from 'app/core';
import { MuroService } from './muro.service';

@Component({
    selector: 'jhi-muro',
    templateUrl: './muro.component.html'
})
export class MuroComponent implements OnInit, OnDestroy {
    muros: IMuro[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private muroService: MuroService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {}

    loadAll() {
        this.muroService.query().subscribe(
            (res: HttpResponse<IMuro[]>) => {
                this.muros = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInMuros();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IMuro) {
        return item.id;
    }

    registerChangeInMuros() {
        this.eventSubscriber = this.eventManager.subscribe('muroListModification', response => this.loadAll());
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
