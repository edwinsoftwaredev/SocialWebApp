import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IMuro } from 'app/shared/model/muro.model';
import { MuroService } from './muro.service';

@Component({
    selector: 'jhi-muro-update',
    templateUrl: './muro-update.component.html'
})
export class MuroUpdateComponent implements OnInit {
    muro: IMuro;
    isSaving: boolean;

    constructor(private muroService: MuroService, private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ muro }) => {
            this.muro = muro;
        });
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.muro.id !== undefined) {
            this.subscribeToSaveResponse(this.muroService.update(this.muro));
        } else {
            this.subscribeToSaveResponse(this.muroService.create(this.muro));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IMuro>>) {
        result.subscribe((res: HttpResponse<IMuro>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    private onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    private onSaveError() {
        this.isSaving = false;
    }
}
