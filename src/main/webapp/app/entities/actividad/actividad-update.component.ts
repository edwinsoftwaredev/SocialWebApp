import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { JhiAlertService } from 'ng-jhipster';

import { IActividad } from 'app/shared/model/actividad.model';
import { ActividadService } from './actividad.service';
import { IUsuario } from 'app/shared/model/usuario.model';
import { UsuarioService } from 'app/entities/usuario';

@Component({
    selector: 'jhi-actividad-update',
    templateUrl: './actividad-update.component.html'
})
export class ActividadUpdateComponent implements OnInit {
    actividad: IActividad;
    isSaving: boolean;

    usuarios: IUsuario[];
    fechaInicioDp: any;
    fechaFinDp: any;

    constructor(
        private jhiAlertService: JhiAlertService,
        private actividadService: ActividadService,
        private usuarioService: UsuarioService,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ actividad }) => {
            this.actividad = actividad;
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
        if (this.actividad.id !== undefined) {
            this.subscribeToSaveResponse(this.actividadService.update(this.actividad));
        } else {
            this.subscribeToSaveResponse(this.actividadService.create(this.actividad));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IActividad>>) {
        result.subscribe((res: HttpResponse<IActividad>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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

    getSelected(selectedVals: Array<any>, option: any) {
        if (selectedVals) {
            for (let i = 0; i < selectedVals.length; i++) {
                if (option.id === selectedVals[i].id) {
                    return selectedVals[i];
                }
            }
        }
        return option;
    }
}
