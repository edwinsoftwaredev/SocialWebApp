import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IActividad } from 'app/shared/model/actividad.model';

@Component({
    selector: 'jhi-actividad-detail',
    templateUrl: './actividad-detail.component.html'
})
export class ActividadDetailComponent implements OnInit {
    actividad: IActividad;

    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ actividad }) => {
            this.actividad = actividad;
        });
    }

    previousState() {
        window.history.back();
    }
}
