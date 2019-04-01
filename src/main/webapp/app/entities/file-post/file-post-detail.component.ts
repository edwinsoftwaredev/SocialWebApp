import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JhiDataUtils } from 'ng-jhipster';

import { IFilePost } from 'app/shared/model/file-post.model';

@Component({
    selector: 'jhi-file-post-detail',
    templateUrl: './file-post-detail.component.html'
})
export class FilePostDetailComponent implements OnInit {
    filePost: IFilePost;

    constructor(private dataUtils: JhiDataUtils, private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ filePost }) => {
            this.filePost = filePost;
        });
    }

    byteSize(field) {
        return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        return this.dataUtils.openFile(contentType, field);
    }
    previousState() {
        window.history.back();
    }
}
