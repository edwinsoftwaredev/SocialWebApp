import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { JhiAlertService } from 'ng-jhipster';

import { ILike } from 'app/shared/model/like.model';
import { LikeService } from './like.service';
import { IPost } from 'app/shared/model/post.model';
import { PostService } from 'app/entities/post';
import { UsuarioService } from 'app/entities/usuario';
import { IUsuario } from 'app/shared/model/usuario.model';

@Component({
    selector: 'jhi-like-update',
    templateUrl: './like-update.component.html'
})
export class LikeUpdateComponent implements OnInit {
    like: ILike;
    isSaving: boolean;

    posts: IPost[];
    fechaLikeDp: any;
    usuarios: IUsuario[];

    constructor(
        private jhiAlertService: JhiAlertService,
        private likeService: LikeService,
        private postService: PostService,
        private usuarioService: UsuarioService,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ like }) => {
            this.like = like;
        });
        this.postService.query().subscribe(
            (res: HttpResponse<IPost[]>) => {
                this.posts = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
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
        if (this.like.id !== undefined) {
            this.subscribeToSaveResponse(this.likeService.update(this.like));
        } else {
            this.subscribeToSaveResponse(this.likeService.create(this.like));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<ILike>>) {
        result.subscribe((res: HttpResponse<ILike>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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

    trackPostById(index: number, item: IPost) {
        return item.id;
    }

    trackUsuarioById(index: number, item: IUsuario) {
        return item.id;
    }
}
