import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IMensaje } from 'app/shared/model/mensaje.model';
import { Principal } from 'app/core';
import { MensajeService } from './mensaje.service';

@Component({
    selector: 'jhi-mensaje',
    templateUrl: './mensaje.component.html'
})
export class MensajeComponent implements OnInit, OnDestroy {
    mensajes: IMensaje[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private mensajeService: MensajeService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {}

    loadAll() {
        this.mensajeService.query().subscribe(
            (res: HttpResponse<IMensaje[]>) => {
                this.mensajes = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInMensajes();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IMensaje) {
        return item.id;
    }

    registerChangeInMensajes() {
        this.eventSubscriber = this.eventManager.subscribe('mensajeListModification', response => this.loadAll());
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
