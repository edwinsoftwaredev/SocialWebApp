import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { IPerfil } from 'app/home-perfil/home-perfil.component';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { IUsuario, Usuario } from 'app/shared/model/usuario.model';
import { IRelacion, Relacion } from 'app/shared/model/relacion.model';
import * as moment from 'moment';
import { UsuarioService } from 'app/entities/usuario';
import { Account, Principal } from 'app/core';
import { RelacionService } from 'app/entities/relacion';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { debounceTime, map } from 'rxjs/operators';
import { SearchBarService } from 'app/search-bar/search-bar.service';

@Component({
    selector: 'jhi-search-bar',
    templateUrl: './search-bar.component.html',
    styles: []
})
export class SearchBarComponent implements OnInit {
    searchProfilesSubscription: Subscription;
    profileNameCtrl: FormControl;
    filteredProfiles: Observable<IPerfil[]>;
    searchingSpinnerFlag: boolean;
    profiles: IPerfil[] = [];
    usuario: IUsuario;
    relaciones: IRelacion[] = [];
    solicitudesRecibidas: IRelacion[] = [];

    @ViewChild('snackBarTemplate')
    snackBarTemplate: TemplateRef<any>;

    snackProfilePicUrlSanitized: any;
    snackProfileName: string;

    constructor(
        private usuarioService: UsuarioService,
        private principal: Principal,
        private relacionService: RelacionService,
        private sanitizer: DomSanitizer,
        public snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<SearchBarComponent>,
        private searchBarService: SearchBarService,
        private changeDetectionRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.profileNameCtrl = new FormControl('');

        this.filteredProfiles = this.profileNameCtrl.valueChanges.pipe(
            debounceTime(1000),
            map(searchString => (searchString ? this._filterProfiles(searchString.toLowerCase()) : (this.profiles = [])))
        );

        this.principal.identity().then((account: Account) => {
            this.usuarioService.findUsuario(account.login).subscribe(
                (res: HttpResponse<IUsuario>) => {
                    if (res.body) {
                        this.usuario = res.body;
                        this.loadAll();
                    }
                },
                (err: HttpErrorResponse) => {
                    // *
                }
            );
        });
    }

    loadAll() {
        this.relacionService.findByUsuario(this.usuario.usuario).subscribe((res: HttpResponse<IRelacion[]>) => {
            this.relaciones = res.body;

            // this.relaciones contiene las solicitudes enviadas, es decir, aquellas relaciones(registro) con estado = false
            // y tambien contiene aquellas relaciones(registro) donde define que el usuario es amigo de otro
            // es decir, donde el estado es = true
        });

        this.relacionService.findSolicitudesRecibidasByUsuario(this.usuario.id).subscribe((response: HttpResponse<IRelacion[]>) => {
            this.solicitudesRecibidas = response.body;

            // obtener amigo del usuario

            this.solicitudesRecibidas = this.solicitudesRecibidas
                .filter((relacion: IRelacion) => relacion.estado === false)
                .map((relacion: IRelacion) => {
                    relacion.usuario.profilePic = this.getSanitizedUrl(relacion.usuario.profilePic, relacion.usuario.profilePicContentType);
                    return relacion;
                });
        });
    }

    private _filterProfiles(searchString: string): IPerfil[] {
        const filterValue = searchString.toLowerCase().replace(/\s/g, '');

        // llenar el arreglo profiles con los perfiles de la base
        // para lograr un mejor filtrado concatenar el primer segundo nombre y primer segundo apellido sin espacios
        // ejemplo: edwingerardomartinezpaz

        if (searchString.length !== 0) {
            if (this.searchProfilesSubscription) {
                this.searchProfilesSubscription.unsubscribe();
                this.profiles.length = 0;
                this.profiles = [];
            }

            this.searchingSpinnerFlag = true;

            this.searchProfilesSubscription = this.usuarioService
                .findUsuarioBySearchString(filterValue)
                .subscribe((response: HttpResponse<IUsuario[]>) => {
                    if (response.body) {
                        this.searchingSpinnerFlag = false;

                        response.body.forEach((usuario: IUsuario) => {
                            if (usuario.id !== this.usuario.id) {
                                this.profiles.push({
                                    firstNameLastName:
                                        usuario.primerNombre +
                                        '' +
                                        (usuario.segundoNombre ? usuario.segundoNombre : '') +
                                        '' +
                                        usuario.primerApellido +
                                        '' +
                                        (usuario.segundoApellido ? usuario.segundoApellido : ''),
                                    firstNameLastNameSpaced:
                                        usuario.primerNombre +
                                        ' ' +
                                        (usuario.segundoNombre ? usuario.segundoNombre : '') +
                                        ' ' +
                                        usuario.primerApellido +
                                        ' ' +
                                        (usuario.segundoApellido ? usuario.segundoApellido : ''),
                                    usuario: usuario.usuario,
                                    envieSolicitud: false,
                                    envioSolicitud: false,
                                    amigos: false,
                                    profilePicUrlSanitized: this.getSanitizedUrl(usuario.profilePic, usuario.profilePicContentType),
                                    profilePicContentType: usuario.profilePicContentType,
                                    id: usuario.id
                                });
                            }

                            this.getEstadosBarraBusqueda(); // determinar los estados de la relacion del usuarios con los usuarios filtrados
                        });
                    }
                });
        }

        return this.profiles;
    }

    getEstadosBarraBusqueda(): void {
        // determinar si el usuario envio solicitud o si son amigos
        this.profiles.map((perfil: IPerfil) => {
            this.relaciones.filter((relacion: IRelacion) => perfil.id === relacion.amigoId).map((relacion: IRelacion) => {
                if (relacion.estado) {
                    perfil.amigos = true;
                } else {
                    perfil.envieSolicitud = true;
                }
            });
        });

        // determinar si al usuario le enviaron solicitud
        // se vuelve a hacer una busqueda de los usuario que ya enviaron una solicitud
        // por ejemplo si los dos usuarios estan conectados al mismos tiempo, si uno envia una solicitud a otro
        // en ese tiempo, en la barra de busqueda del otro usuario debera aparecer que tiene que aceptar la solicitud en lugar
        // de enviar una solicitud

        // ESTA FUNCION DEBERIA DE TENER COMO PARAMETRO LO QUE EL USUARIO VA ESCRIBIENDO EN LA BARRA DE BUSQUEDA
        // PARA HACER RAPIDA LA BUSQUEDA Y NO CARGAR AL CLIENTE

        this.relacionService.findSolicitudesRecibidasByUsuario(this.usuario.id).subscribe((response: HttpResponse<IRelacion[]>) => {
            this.solicitudesRecibidas = response.body;

            this.solicitudesRecibidas = this.solicitudesRecibidas
                .filter((relacion: IRelacion) => relacion.estado === false)
                .map((relacion: IRelacion) => {
                    relacion.usuario.profilePic = this.getSanitizedUrl(relacion.usuario.profilePic, relacion.usuario.profilePicContentType);
                    return relacion;
                });

            this.profiles.map((perfil: IPerfil) => {
                this.solicitudesRecibidas
                    .filter((relacion: IRelacion) => perfil.id === relacion.usuario.id && relacion.estado === false)
                    .map((relacion: IRelacion) => {
                        perfil.envioSolicitud = true;
                    });
            });
        });
    }

    enviarSolicitudBusqueda(event, perfil: IPerfil) {
        event.stopPropagation();

        this.snackProfilePicUrlSanitized = perfil.profilePicUrlSanitized;
        this.snackProfileName = perfil.firstNameLastNameSpaced;

        this.snackBar.openFromTemplate(this.snackBarTemplate, {
            duration: 5000
        });

        const usuarioIdRelacion: IUsuario = new Usuario(this.usuario.id, this.usuario.usuario);
        const relacionEnvioSolicitud: IRelacion = new Relacion(null, perfil.id, false, moment(), usuarioIdRelacion);

        this.relacionService.create(relacionEnvioSolicitud).subscribe((relacionResponse: HttpResponse<IRelacion>) => {
            perfil.envieSolicitud = true;
            perfil.amigos = false;
            perfil.envioSolicitud = false;

            this.relaciones.push(relacionResponse.body);
            this.searchBarService.pushRelacion(relacionResponse.body);
            this.changeDetectionRef.markForCheck();
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    aceptarSolicitudBusqueda(event, perfil: IPerfil) {
        event.stopPropagation();

        const usuarioIdRelacion: IUsuario = new Usuario(this.usuario.id, this.usuario.usuario);
        const relacionAceptarSolicitud: IRelacion = new Relacion(null, perfil.id, true, moment(), usuarioIdRelacion);

        this.relacionService.create(relacionAceptarSolicitud).subscribe((relacionResponse: HttpResponse<IRelacion>) => {
            perfil.amigos = true;
            perfil.envioSolicitud = false;
            perfil.envieSolicitud = false;

            this.relaciones.push(relacionResponse.body);
            this.searchBarService.pushRelacion(relacionResponse.body);
            this.changeDetectionRef.markForCheck();

            // aqui se cambia el estado en solicitudesRecibidas que es usado en el panel derecho
            // donde se muestran las solicitudes por aceptar

            const usuario: IUsuario = this.solicitudesRecibidas.splice(
                this.solicitudesRecibidas.indexOf(
                    this.solicitudesRecibidas.filter((relacion: IRelacion) => relacion.usuario.id === perfil.id)[0]
                ),
                1
            )[0].usuario;
        });
    }

    getSanitizedUrl(file: any, fileContentType: string) {
        if (file) {
            if (file.toString().charAt(0) === 'd') {
                return this.sanitizer.sanitize(4, file);
            } else {
                return this.sanitizer.sanitize(4, 'data:' + fileContentType + ';base64,' + file);
            }
        }
    }
}
