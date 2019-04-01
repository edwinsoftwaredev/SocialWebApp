import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
import { map } from 'rxjs/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from '../../shared/util/request-util';
import { IUsuario } from '../../shared/model/usuario.model';

type EntityResponseType = HttpResponse<IUsuario>;
type EntityArrayResponseType = HttpResponse<IUsuario[]>;

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    public resourceUrl = SERVER_API_URL + 'api/usuarios';

    constructor(private http: HttpClient) {}

    create(usuario: IUsuario): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(usuario);
        return this.http
            .post<IUsuario>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    update(usuario: IUsuario): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(usuario);
        return this.http
            .put<IUsuario>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<IUsuario>(`${this.resourceUrl}/${id}`, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    findUsuario(usuario: String): Observable<EntityResponseType> {
        return this.http
            .get(`${this.resourceUrl}/muro/${usuario}`, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    findUsuarioBySearchString(searchString: String): Observable<HttpResponse<IUsuario[]>> {
        const httpParams: HttpParams = new HttpParams().set('searchString', searchString.toString());

        return this.http
            .get(`${this.resourceUrl}/searching`, { params: httpParams, observe: 'response' })
            .pipe(map((response: HttpResponse<IUsuario[]>) => this.convertDateArrayFromServerSearchString(response)));
    }

    findUsuarioWithChat(usuarioId: number): Observable<HttpResponse<IUsuario>> {
        const httpParams: HttpParams = new HttpParams().set('usuarioId', usuarioId.toString());

        return this.http.get<IUsuario>(`${this.resourceUrl}/chats`, { params: httpParams, observe: 'response' });
    }

    convertDateArrayFromServerSearchString(response: HttpResponse<IUsuario[]>): HttpResponse<IUsuario[]> {
        if (response.body) {
            response.body.forEach((usuario: IUsuario) => {
                usuario.fechaNacimiento = usuario.fechaNacimiento != null ? moment(usuario.fechaNacimiento) : null;
                usuario.fechaRegistro = usuario.fechaRegistro != null ? moment(usuario.fechaRegistro) : null;
            });
        }

        return response;
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IUsuario[]>(this.resourceUrl, { params: options, observe: 'response' })
            .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    protected convertDateFromClient(usuario: IUsuario): IUsuario {
        const copy: IUsuario = Object.assign({}, usuario, {
            fechaNacimiento:
                usuario.fechaNacimiento != null && usuario.fechaNacimiento.isValid() ? usuario.fechaNacimiento.format(DATE_FORMAT) : null,
            fechaRegistro:
                usuario.fechaRegistro != null && usuario.fechaRegistro.isValid() ? usuario.fechaRegistro.format(DATE_FORMAT) : null
        });
        return copy;
    }

    protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
        if (res.body) {
            res.body.fechaNacimiento = res.body.fechaNacimiento != null ? moment(res.body.fechaNacimiento) : null;
            res.body.fechaRegistro = res.body.fechaRegistro != null ? moment(res.body.fechaRegistro) : null;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
        if (res.body) {
            res.body.forEach((usuario: IUsuario) => {
                usuario.fechaNacimiento = usuario.fechaNacimiento != null ? moment(usuario.fechaNacimiento) : null;
                usuario.fechaRegistro = usuario.fechaRegistro != null ? moment(usuario.fechaRegistro) : null;
            });
        }
        return res;
    }
}
