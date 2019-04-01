import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IMuro } from 'app/shared/model/muro.model';

@Component({
    selector: 'jhi-muro-detail',
    templateUrl: './muro-detail.component.html'
})
export class MuroDetailComponent implements OnInit {
    muro: IMuro;

    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ muro }) => {
            this.muro = muro;
        });
    }

    previousState() {
        window.history.back();
    }
}
