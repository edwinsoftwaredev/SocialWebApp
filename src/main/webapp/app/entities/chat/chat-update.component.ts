import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { JhiAlertService } from 'ng-jhipster';

import { IChat } from 'app/shared/model/chat.model';
import { ChatService } from './chat.service';
import { IUsuario } from 'app/shared/model/usuario.model';
import { UsuarioService } from 'app/entities/usuario';

@Component({
    selector: 'jhi-chat-update',
    templateUrl: './chat-update.component.html'
})
export class ChatUpdateComponent implements OnInit {
    chat: IChat;
    isSaving: boolean;

    usuarios: IUsuario[];
    fechaCreacionDp: any;
    ultimaVezVistoDp: any;

    constructor(
        private jhiAlertService: JhiAlertService,
        private chatService: ChatService,
        private usuarioService: UsuarioService,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ chat }) => {
            this.chat = chat;
        });
        this.usuarioService.query().subscribe(
            (res: HttpResponse<IUsuario[]>) => {
                this.usuarios = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.chat.id !== undefined) {
            this.subscribeToSaveResponse(this.chatService.update(this.chat));
        } else {
            this.subscribeToSaveResponse(this.chatService.create(this.chat));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IChat>>) {
        result.subscribe((res: HttpResponse<IChat>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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

    trackUsuarioById(index: number, item: IUsuario) {
        return item.id;
    }
}
