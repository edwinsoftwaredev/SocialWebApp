import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ILike } from 'app/shared/model/like.model';

@Component({
    selector: 'jhi-like-detail',
    templateUrl: './like-detail.component.html'
})
export class LikeDetailComponent implements OnInit {
    like: ILike;

    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ like }) => {
            this.like = like;
        });
    }

    previousState() {
        window.history.back();
    }
}
