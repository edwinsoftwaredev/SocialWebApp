import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { JhiAlertService } from 'ng-jhipster';

import { IRelacion } from 'app/shared/model/relacion.model';
import { RelacionService } from './relacion.service';
import { IUsuario } from 'app/shared/model/usuario.model';
import { UsuarioService } from 'app/entities/usuario';

@Component({
    selector: 'jhi-relacion-update',
    templateUrl: './relacion-update.component.html'
})
export class RelacionUpdateComponent implements OnInit {
    relacion: IRelacion;
    isSaving: boolean;

    usuarios: IUsuario[];
    fechaDp: any;

    constructor(
        private jhiAlertService: JhiAlertService,
        private relacionService: RelacionService,
        private usuarioService: UsuarioService,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ relacion }) => {
            this.relacion = relacion;
        });
        this.usuarioService.query().subscribe(
            (res: HttpResponse<IUsuario[]>) => {
                this.usuarios = res.body;
                this.usuarios.map(usuario => (usuario.actividads = null)); // sin esto hay un null pointer exception del lado del server
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.relacion.id !== undefined) {
            this.subscribeToSaveResponse(this.relacionService.update(this.relacion));
        } else {
            this.subscribeToSaveResponse(this.relacionService.create(this.relacion));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IRelacion>>) {
        result.subscribe((res: HttpResponse<IRelacion>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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
