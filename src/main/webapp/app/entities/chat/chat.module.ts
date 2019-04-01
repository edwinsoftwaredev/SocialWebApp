import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SocialProjectSharedModule } from 'app/shared';
import {
    ChatComponent,
    ChatDetailComponent,
    ChatUpdateComponent,
    ChatDeletePopupComponent,
    ChatDeleteDialogComponent,
    chatRoute,
    chatPopupRoute
} from './';

const ENTITY_STATES = [...chatRoute, ...chatPopupRoute];

@NgModule({
    imports: [SocialProjectSharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [ChatComponent, ChatDetailComponent, ChatUpdateComponent, ChatDeleteDialogComponent, ChatDeletePopupComponent],
    entryComponents: [ChatComponent, ChatUpdateComponent, ChatDeleteDialogComponent, ChatDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SocialProjectChatModule {}
