import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService, JhiDataUtils } from 'ng-jhipster';

import { IFilePost } from 'app/shared/model/file-post.model';
import { FilePostService } from './file-post.service';
import { IPost } from 'app/shared/model/post.model';
import { PostService } from 'app/entities/post';

@Component({
    selector: 'jhi-file-post-update',
    templateUrl: './file-post-update.component.html'
})
export class FilePostUpdateComponent implements OnInit {
    filePost: IFilePost;
    isSaving: boolean;

    posts: IPost[];

    constructor(
        private dataUtils: JhiDataUtils,
        private jhiAlertService: JhiAlertService,
        private filePostService: FilePostService,
        private postService: PostService,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ filePost }) => {
            this.filePost = filePost;
        });
        this.postService.query().subscribe(
            (res: HttpResponse<IPost[]>) => {
                this.posts = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    byteSize(field) {
        return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        return this.dataUtils.openFile(contentType, field);
    }

    setFileData(event, entity, field, isImage) {
        this.dataUtils.setFileData(event, entity, field, isImage);
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.filePost.id !== undefined) {
            this.subscribeToSaveResponse(this.filePostService.update(this.filePost));
        } else {
            this.subscribeToSaveResponse(this.filePostService.create(this.filePost));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<IFilePost>>) {
        result.subscribe((res: HttpResponse<IFilePost>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
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
}
