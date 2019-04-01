import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { JhiAlertService } from 'ng-jhipster';

import { IMensaje } from 'app/shared/model/mensaje.model';
import { MensajeService } from './mensaje.service';
import { IChat } from 'app/shared/model/chat.model';
import { ChatService } from 'app/entities/chat';

@Component({
    selector: 'jhi-mensaje-update',
    templateUrl: './mensaje-update.component.html'
})
export class MensajeUpdateComponent implements OnInit {
    mensaje: IMensaje;
    isSaving: boolean;

    chats: IChat[];
    fechaCreacionDp: any;

    constructor(
        private jhiAlertService: JhiAlertService,
        private mensajeService: MensajeService,
        private chatService: ChatService,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ mensaje }) => {
            this.mensaje = mensaje;
        });
        this.chatService.query().subscribe(
            (res: HttpResponse<IChat[]>) => {
                this.chats = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.mensaje.id !== undefined) {
            this.subscribeToSaveResponse(this.mensajeService.update(this.mensaje));
        } else {
            this.subscribeToSaveResponse(this.mensajeService.create(this.mensaje));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IMensaje>>) {
        result.subscribe((res: HttpResponse<IMensaje>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    private onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackChatById(index: number, item: IChat) {
        return item.id;
    }
}
