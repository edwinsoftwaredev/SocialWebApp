import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IMensaje } from 'app/shared/model/mensaje.model';
import { MensajeService } from './mensaje.service';

@Component({
    selector: 'jhi-mensaje-delete-dialog',
    templateUrl: './mensaje-delete-dialog.component.html'
})
export class MensajeDeleteDialogComponent {
    mensaje: IMensaje;

    constructor(private mensajeService: MensajeService, public activeModal: NgbActiveModal, private eventManager: JhiEventManager) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.mensajeService.delete(id).subscribe(response => {
            this.eventManager.broadcast({
                name: 'mensajeListModification',
                content: 'Deleted an mensaje'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-mensaje-delete-popup',
    template: ''
})
export class MensajeDeletePopupComponent implements OnInit, OnDestroy {
    private ngbModalRef: NgbModalRef;

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ mensaje }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(MensajeDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.mensaje = mensaje;
                this.ngbModalRef.result.then(
                    result => {
                        this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                        this.ngbModalRef = null;
                    },
                    reason => {
                        this.router.navigate([{ outlets: { popup: null } }], { replaceUrl: true, queryParamsHandling: 'merge' });
                        this.ngbModalRef = null;
                    }
                );
            }, 0);
        });
    }

    ngOnDestroy() {
        this.ngbModalRef = null;
    }
}
