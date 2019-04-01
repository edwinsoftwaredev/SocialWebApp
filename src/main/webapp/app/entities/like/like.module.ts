import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SocialProjectSharedModule } from 'app/shared';
import {
    LikeComponent,
    LikeDetailComponent,
    LikeUpdateComponent,
    LikeDeletePopupComponent,
    LikeDeleteDialogComponent,
    likeRoute,
    likePopupRoute
} from './';

const ENTITY_STATES = [...likeRoute, ...likePopupRoute];

@NgModule({
    imports: [SocialProjectSharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [LikeComponent, LikeDetailComponent, LikeUpdateComponent, LikeDeleteDialogComponent, LikeDeletePopupComponent],
    entryComponents: [LikeComponent, LikeUpdateComponent, LikeDeleteDialogComponent, LikeDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SocialProjectLikeModule {}
