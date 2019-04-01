import { Injectable } from '@angular/core';
import { Account, Principal } from 'app/core';
import { Observable } from 'rxjs';
import { IUsuario } from 'app/shared/model/usuario.model';
import { HttpResponse } from '@angular/common/http';
import { UsuarioService } from 'app/entities/usuario';

@Injectable({
    providedIn: 'root'
})
export class HomePerfilService {
    account: Account;
    usuario: IUsuario;

    constructor(private principal: Principal, private usuarioService: UsuarioService) {}
}
