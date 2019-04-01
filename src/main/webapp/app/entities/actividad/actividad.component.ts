import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IActividad } from 'app/shared/model/actividad.model';
import { Principal } from 'app/core';
import { ActividadService } from './actividad.service';

@Component({
    selector: 'jhi-actividad',
    templateUrl: './actividad.component.html'
})
export class ActividadComponent implements OnInit, OnDestroy {
    actividads: IActividad[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private actividadService: ActividadService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {}

    loadAll() {
        this.actividadService.query().subscribe(
            (res: HttpResponse<IActividad[]>) => {
                this.actividads = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInActividads();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IActividad) {
        return item.id;
    }

    registerChangeInActividads() {
        this.eventSubscriber = this.eventManager.subscribe('actividadListModification', response => this.loadAll());
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
