import './vendor.ts';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Ng2Webstorage } from 'ngx-webstorage';

import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';
import { SocialProjectSharedModule } from 'app/shared';
import { SocialProjectCoreModule } from 'app/core';
import { SocialProjectAppRoutingModule } from './app-routing.module';
import { SocialProjectHomeModule } from './home/home.module';
import { SocialProjectAccountModule } from './account/account.module';
import { SocialProjectEntityModule } from './entities/entity.module';

import { HomePerfilModule } from 'app/home-perfil/home-perfil.module';

import * as moment from 'moment';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import { JhiMainComponent, NavbarComponent, FooterComponent, PageRibbonComponent, ErrorComponent } from './layouts';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ProfileDetailsFormComponent } from './profile-details-form/profile-details-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VisitPerfilModule } from './visit-perfil/visit-perfil.module';
import { PanelChatComponent } from './panel-chat/panel-chat.component';
import { ProfilePanelComponent } from './profile-panel/profile-panel.component';
import { SearchBarComponent } from './search-bar/search-bar.component';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        SocialProjectAppRoutingModule,
        Ng2Webstorage.forRoot({ prefix: 'jhi', separator: '-' }),
        SocialProjectSharedModule,
        SocialProjectCoreModule,
        SocialProjectHomeModule,
        SocialProjectAccountModule,
        InfiniteScrollModule,
        // jhipster-needle-angular-add-module JHipster will add new module here
        SocialProjectEntityModule,
        HomePerfilModule,
        VisitPerfilModule
    ],
    declarations: [
        JhiMainComponent,
        NavbarComponent,
        ErrorComponent,
        PageRibbonComponent,
        FooterComponent,
        ProfileDetailsFormComponent,
        PanelChatComponent,
        ProfilePanelComponent,
        SearchBarComponent
    ],
    entryComponents: [PanelChatComponent, SearchBarComponent],
    providers: [
        {
            // este interceptor agregar el jwt a las solicitudes, si la solicitud es null avanza
            // avanza al siguiente interceptor de solicitud HTTP
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            // este interceptor verifica el http resonse para ver el status si es 401 o unauthrized
            // y enviarlo de nuevo a la pantalla de login
            // si no hay un status 401 avanza al siguiente interceptor
            provide: HTTP_INTERCEPTORS,
            useClass: AuthExpiredInterceptor,
            multi: true
        },
        {
            // si por ejemplo sucede algun error en el servidor como que no se guarde un dato
            // se devolvera algun error de parte del servidor con algun status diferente a 401
            // si eso sucede este interceptor toma ese error y hace el llamado a una funcion para por
            // ejemplo mostrar un error
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorHandlerInterceptor,
            multi: true
        },
        {
            // este es un interceptor de headers que busca un header costumizado por jhipster para
            // mostrar notificiones
            provide: HTTP_INTERCEPTORS,
            useClass: NotificationInterceptor,
            multi: true
        }
    ],
    bootstrap: [JhiMainComponent]
})
export class SocialProjectAppModule {
    constructor(private dpConfig: NgbDatepickerConfig) {
        this.dpConfig.minDate = { year: moment().year() - 100, month: 1, day: 1 };
    }
}
