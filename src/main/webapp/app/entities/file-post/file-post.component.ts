import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService, JhiDataUtils } from 'ng-jhipster';

import { IFilePost } from 'app/shared/model/file-post.model';
import { Principal } from 'app/core';
import { FilePostService } from './file-post.service';

@Component({
    selector: 'jhi-file-post',
    templateUrl: './file-post.component.html'
})
export class FilePostComponent implements OnInit, OnDestroy {
    filePosts: IFilePost[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private filePostService: FilePostService,
        private jhiAlertService: JhiAlertService,
        private dataUtils: JhiDataUtils,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {}

    loadAll() {
        this.filePostService.query().subscribe(
            (res: HttpResponse<IFilePost[]>) => {
                this.filePosts = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInFilePosts();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IFilePost) {
        return item.id;
    }

    byteSize(field) {
        return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        return this.dataUtils.openFile(contentType, field);
    }

    registerChangeInFilePosts() {
        this.eventSubscriber = this.eventManager.subscribe('filePostListModification', response => this.loadAll());
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
