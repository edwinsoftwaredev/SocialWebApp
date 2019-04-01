import { Injectable } from '@angular/core';
import { Account, Principal } from 'app/core';
import { Observable, Subject } from 'rxjs';
import { IUsuario } from 'app/shared/model/usuario.model';
import { HttpResponse } from '@angular/common/http';
import { UsuarioService } from 'app/entities/usuario';
import { MatDialog, MatDialogRef } from '@angular/material';
import { NewPostModalComponent } from 'app/new-post-modal/new-post-modal.component';
import { IPost } from 'app/shared/model/post.model';

@Injectable({
    providedIn: 'root'
})
export class NavbarService {
    statusRightPanel: Subject<boolean> = new Subject<boolean>();
    statusRightPanelObservable: Observable<boolean> = this.statusRightPanel.asObservable();

    refreshUsuario: Subject<boolean> = new Subject<boolean>();
    refreshUsuarioObservable: Observable<boolean> = this.refreshUsuario.asObservable();

    forceCloseSideNavSubject: Subject<boolean> = new Subject<boolean>();
    forceCloseSideNavObservable: Observable<boolean> = this.forceCloseSideNavSubject.asObservable();

    dialogRefSubject: Subject<MatDialogRef<NewPostModalComponent, IPost>> = new Subject<MatDialogRef<NewPostModalComponent, IPost>>();
    private _dialogRefObservable: Observable<MatDialogRef<NewPostModalComponent, IPost>> = this.dialogRefSubject.asObservable();

    sideBarOpenClick: Subject<boolean> = new Subject<boolean>();
    private _sideBarOpenClickObservable: Observable<boolean> = this.sideBarOpenClick.asObservable();
    constructor(private dialog: MatDialog) {}

    crearPost() {
        this.dialogRefSubject.next(
            this.dialog.open(NewPostModalComponent, {
                width: '40%',
                minWidth: '400px',
                data: {
                    postToEdit: null
                }
            })
        );
    }

    openSideBar(abierto: boolean) {
        this.sideBarOpenClick.next(abierto);
    }

    rightPanelStatus(status) {
        this.statusRightPanel.next(status);
    }

    closeSideBar() {
        this.sideBarOpenClick.next(false);
    }

    get sideBarOpenClickObservable(): Observable<boolean> {
        return this._sideBarOpenClickObservable;
    }
    get dialogRefObservable(): Observable<MatDialogRef<NewPostModalComponent, IPost>> {
        return this._dialogRefObservable;
    }
}
