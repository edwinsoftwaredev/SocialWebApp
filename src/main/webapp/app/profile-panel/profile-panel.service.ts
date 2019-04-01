import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProfilePanelService {
    refreshPanel: Subject<boolean> = new Subject<boolean>();
    refreshPanelObservable: Observable<boolean> = this.refreshPanel.asObservable();

    closeChatPanel: Subject<boolean> = new Subject<boolean>();
    closeChatPanelObservable: Observable<boolean> = this.closeChatPanel.asObservable();

    constructor() {}
}
