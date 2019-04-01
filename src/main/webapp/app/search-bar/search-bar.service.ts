import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IRelacion } from 'app/shared/model/relacion.model';

@Injectable({
    providedIn: 'root'
})
export class SearchBarService {
    relacionSubject: Subject<IRelacion> = new Subject<IRelacion>();
    private _relacionObservable: Observable<IRelacion> = this.relacionSubject.asObservable();

    constructor() {}

    pushRelacion(relacion: IRelacion) {
        this.relacionSubject.next(relacion);
    }

    get relacionObservable(): Observable<IRelacion> {
        return this._relacionObservable;
    }
}
