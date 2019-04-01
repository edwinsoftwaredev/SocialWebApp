import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IRelacion } from 'app/shared/model/relacion.model';

@Component({
    selector: 'jhi-relacion-detail',
    templateUrl: './relacion-detail.component.html'
})
export class RelacionDetailComponent implements OnInit {
    relacion: IRelacion;

    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ relacion }) => {
            this.relacion = relacion;
        });
    }

    previousState() {
        window.history.back();
    }
}
