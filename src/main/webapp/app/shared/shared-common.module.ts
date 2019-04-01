import { NgModule } from '@angular/core';

import { SocialProjectSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent } from './';

@NgModule({
    imports: [SocialProjectSharedLibsModule],
    declarations: [JhiAlertComponent, JhiAlertErrorComponent],
    exports: [SocialProjectSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent]
})
export class SocialProjectSharedCommonModule {}
