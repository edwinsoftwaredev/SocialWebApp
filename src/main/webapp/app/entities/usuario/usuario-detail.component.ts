import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JhiDataUtils } from 'ng-jhipster';

import { IUsuario } from 'app/shared/model/usuario.model';

@Component({
    selector: 'jhi-usuario-detail',
    templateUrl: './usuario-detail.component.html'
})
export class UsuarioDetailComponent implements OnInit {
    usuario: IUsuario;

    constructor(private dataUtils: JhiDataUtils, private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ usuario }) => {
            this.usuario = usuario;
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
