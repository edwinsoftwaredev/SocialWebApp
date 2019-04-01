import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IMuro } from 'app/shared/model/muro.model';

type EntityResponseType = HttpResponse<IMuro>;
type EntityArrayResponseType = HttpResponse<IMuro[]>;

@Injectable({ providedIn: 'root' })
export class MuroService {
    public resourceUrl = SERVER_API_URL + 'api/muros';

    constructor(private http: HttpClient) {}

    create(muro: IMuro): Observable<EntityResponseType> {
        return this.http.post<IMuro>(this.resourceUrl, muro, { observe: 'response' });
    }

    update(muro: IMuro): Observable<EntityResponseType> {
        return this.http.put<IMuro>(this.resourceUrl, muro, { observe: 'response' });
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<IMuro>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IMuro[]>(this.resourceUrl, { params: options, observe: 'response' });
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }
}
