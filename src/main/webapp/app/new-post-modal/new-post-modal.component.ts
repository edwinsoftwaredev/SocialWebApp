import { Principal } from '../core/auth/principal.service';

import { IFilePost, FilePost } from './../shared/model/file-post.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Component, Inject, OnInit } from '@angular/core';

import { FileUploadValidators } from '@iplab/ngx-file-upload';
import { FormControl, FormGroup } from '@angular/forms';
import { IUsuario } from 'app/shared/model/usuario.model';
import { ILike } from 'app/shared/model/like.model';
import { Moment } from 'moment';
import { IPost, Post } from 'app/shared/model/post.model';
import * as moment from 'moment';
import { Account } from 'app/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { PostService } from 'app/entities/post';
import { FilePostService } from 'app/entities/file-post';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { decode, encode } from 'typescript-base64-arraybuffer';
import { Ng2ImgMaxService } from 'ng2-img-max';

import { UsuarioService } from '../entities/usuario/usuario.service';

@Component({
    selector: 'jhi-new-post-modal',
    templateUrl: './new-post-modal.component.html',
    styleUrls: ['./new-post-modal.component.scss']
})
export class NewPostModalComponent implements OnInit {
    private filesControl = new FormControl(null, FileUploadValidators.filesLimit(1));

    id: number;
    usuario: IUsuario;
    likes: ILike[];
    texto: string;
    url: string;
    fechaPublicacion: Moment;
    filePost: IFilePost[];
    postToEdit: IPost;

    loadingFlag = false;

    cantArchivos = 0;

    archivos: IFilePost[];

    public demoForm = new FormGroup({
        files: this.filesControl
    });

    // para compresion y cambios de tamaño de imagenes
    // https://alligator.io/angular/resizing-images-in-browser-ng2-img-max/

    constructor(
        public dialogRef: MatDialogRef<NewPostModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        private principalService: Principal,
        private usuarioService: UsuarioService,
        private postService: PostService,
        private filePostService: FilePostService,
        private sanitizer: DomSanitizer,
        private ng2ImgService: Ng2ImgMaxService
    ) {
        if (data) {
            if (data.postToEdit) {
                this.postToEdit = <IPost>data.postToEdit;
                this.updatePost(this.postToEdit);
            }
        }
    }

    ngOnInit() {}

    savePost() {
        this.loadingFlag = true;

        const filesPost: IFilePost[] = [];
        // evalua si el post existe, es decir, si lo que se quiere es editar el post
        if (this.postToEdit) {
            this.principalService.identity().then((account: Account) => {
                this.usuarioService.findUsuario(account.login).subscribe((resUsuario: HttpResponse<IUsuario>) => {
                    this.usuario = resUsuario.body;

                    const postToUpdate = new Post(
                        this.postToEdit.id,
                        this.texto,
                        this.url,
                        this.postToEdit.fechaPublicacion,
                        null,
                        null,
                        this.postToEdit.usuario
                    );

                    const postToEditx = this.postToEdit;

                    this.postService.update(postToUpdate).subscribe((res: HttpResponse<IPost>) => {
                        const postUpdated = this.convertDateFromServer(res).body;

                        this.filePostService.deleteAllFilesByPost(postUpdated.id).subscribe((resDel: HttpResponse<any>) => {
                            const filePostService = this.filePostService;

                            if (<File[]>this.demoForm.controls['files'].value) {
                                this.cantArchivos = (<File[]>this.demoForm.controls['files'].value).length;
                            }
                            const dialogRef1 = this.dialogRef;

                            if (this.cantArchivos !== 0) {
                                [(<File[]>this.demoForm.controls['files'].value)[0]].map(file => {
                                    if (file.type === 'image/bmp' || file.type === 'image/jpeg' || file.type === 'image/png') {
                                        this.ng2ImgService.resizeImage(file, 1000, 300).subscribe(result => {
                                            this.ng2ImgService.compressImage(result, 0.075).subscribe(result1 => {
                                                const reader = new FileReader();

                                                const that = this;

                                                reader.onload = function() {
                                                    const arrayBufferFile: ArrayBuffer = <ArrayBuffer>reader.result;

                                                    const array = new Uint8Array(arrayBufferFile);
                                                    const arrayBytes = Array.from(array);

                                                    filePostService
                                                        .create(new FilePost(undefined, result1.type, arrayBytes, postUpdated))
                                                        .subscribe(
                                                            (resFilePost: HttpResponse<IFilePost>) => {
                                                                filesPost.push(resFilePost.body);
                                                                that.loadingFlag = false;
                                                            },
                                                            (resError: HttpErrorResponse) => {
                                                                // console.log(resError.message);
                                                                that.loadingFlag = false;
                                                            },
                                                            () => {
                                                                if (that.cantArchivos === filesPost.length) {
                                                                    postUpdated.filePosts = filesPost;
                                                                    postUpdated.likes = postToEditx.likes;
                                                                    that.loadingFlag = false;
                                                                    dialogRef1.close(postUpdated);
                                                                }
                                                            }
                                                        );
                                                };

                                                reader.readAsArrayBuffer(result1);
                                            });
                                        });
                                    } else if (file.size <= 104857600) {
                                        const reader = new FileReader();

                                        const that = this;

                                        reader.onload = function() {
                                            const arrayBufferFile: ArrayBuffer = <ArrayBuffer>reader.result;

                                            const array = new Uint8Array(arrayBufferFile);
                                            const arrayBytes = Array.from(array);

                                            filePostService.create(new FilePost(undefined, file.type, arrayBytes, postUpdated)).subscribe(
                                                (resFilePost: HttpResponse<IFilePost>) => {
                                                    filesPost.push(resFilePost.body);
                                                    that.loadingFlag = false;
                                                },
                                                (resError: HttpErrorResponse) => {
                                                    // console.log(resError.message);
                                                    that.loadingFlag = false;
                                                },
                                                () => {
                                                    if (that.cantArchivos === filesPost.length) {
                                                        postUpdated.filePosts = filesPost;
                                                        postUpdated.likes = postToEditx.likes;
                                                        that.loadingFlag = false;
                                                        dialogRef1.close(postUpdated);
                                                    }
                                                }
                                            );
                                        };

                                        reader.readAsArrayBuffer(file);
                                    }
                                });
                            } else {
                                postUpdated.likes = postToEditx.likes;
                                this.loadingFlag = false;
                                this.dialogRef.close(postUpdated);
                            }
                        });
                    });
                });
            });
        } else {
            // el post no existe por lo que se crea

            this.principalService.identity().then((account: Account) => {
                this.usuarioService.findUsuario(account.login).subscribe((resUsuario: HttpResponse<IUsuario>) => {
                    this.usuario = resUsuario.body;

                    this.usuario.chats = null;
                    this.usuario.actividads = null;
                    /**
                     * !!esta linea es importante porque si no se define como null las actividades del usuario
                     * se genera un error de nullpointerexception en el servidor al ser enviado el usuario para generar el post.
                     * Este error lo produce jackson al querer deserealizar el objecto post. post -> usuario -> actidades
                     * y al momento de traer el usuario se genera del lado del cliente como un arreglo de actividades vacio
                     * por lo que debe de ser igualado a null si el usuario no tiene actividades. esto hay que arreglarlo tambien para los likes
                     * */

                    let newPost: IPost = new Post(undefined, this.texto, this.url, moment(), null, null, this.usuario);

                    this.postService.create(newPost).subscribe(
                        (resPost: HttpResponse<IPost>) => {
                            newPost = this.convertDateFromServer(resPost).body;

                            const post = new Post(
                                newPost.id,
                                newPost.texto,
                                newPost.url,
                                newPost.fechaPublicacion,
                                undefined,
                                undefined,
                                newPost.usuario
                            );

                            const filePostService = this.filePostService;
                            let cantArchivos = 0;

                            if (<File[]>this.demoForm.controls['files'].value) {
                                cantArchivos = (<File[]>this.demoForm.controls['files'].value).length;
                            }
                            const dialogRef1 = this.dialogRef;

                            if (cantArchivos !== 0) {
                                [(<File[]>this.demoForm.controls['files'].value)[0]].map(file => {
                                    if (file.type === 'image/bmp' || file.type === 'image/jpeg' || file.type === 'image/png') {
                                        this.ng2ImgService.resizeImage(file, 1000, 300).subscribe(result => {
                                            this.ng2ImgService.compressImage(result, 0.075).subscribe(result1 => {
                                                const reader = new FileReader();

                                                const that = this;

                                                reader.onload = function() {
                                                    const arrayBufferFile: ArrayBuffer = <ArrayBuffer>reader.result;

                                                    const array = new Uint8Array(arrayBufferFile);
                                                    const arrayBytes = Array.from(array);

                                                    filePostService
                                                        .create(new FilePost(undefined, result1.type, arrayBytes, post))
                                                        .subscribe(
                                                            (res: HttpResponse<IFilePost>) => {
                                                                filesPost.push(res.body);
                                                                that.loadingFlag = false;
                                                            },
                                                            (res: HttpErrorResponse) => {
                                                                // console.log(res.message);
                                                                that.loadingFlag = false;
                                                            },
                                                            () => {
                                                                if (cantArchivos === filesPost.length) {
                                                                    newPost.filePosts = filesPost;
                                                                    that.loadingFlag = false;
                                                                    dialogRef1.close(newPost);
                                                                }
                                                            }
                                                        );
                                                };

                                                reader.readAsArrayBuffer(result1);
                                            });
                                        });
                                    } else if (file.size <= 104857600) {
                                        const reader = new FileReader();

                                        const that = this;

                                        reader.onload = function() {
                                            const arrayBufferFile: ArrayBuffer = <ArrayBuffer>reader.result;

                                            const array = new Uint8Array(arrayBufferFile);
                                            const arrayBytes = Array.from(array);

                                            filePostService.create(new FilePost(undefined, file.type, arrayBytes, post)).subscribe(
                                                (res: HttpResponse<IFilePost>) => {
                                                    filesPost.push(res.body);
                                                    that.loadingFlag = false;
                                                },
                                                (res: HttpErrorResponse) => {
                                                    // console.log(res.message);
                                                    that.loadingFlag = false;
                                                },
                                                () => {
                                                    if (cantArchivos === filesPost.length) {
                                                        newPost.filePosts = filesPost;
                                                        that.loadingFlag = false;
                                                        dialogRef1.close(newPost);
                                                    }
                                                }
                                            );
                                        };

                                        reader.readAsArrayBuffer(file);
                                    }
                                });
                            } else {
                                this.loadingFlag = false;
                                this.dialogRef.close(post);
                            }
                        },
                        (resError: HttpErrorResponse) => {
                            // console.log(resError.message);
                            this.loadingFlag = false;
                        }
                    );
                });
            });
        }
    }

    protected convertDateFromServer(res: HttpResponse<IPost>): HttpResponse<IPost> {
        if (res.body) {
            res.body.fechaPublicacion = res.body.fechaPublicacion != null ? moment(res.body.fechaPublicacion) : null;
        }
        return res;
    }

    updatePost(post: IPost) {
        // console.log(post);

        this.id = post.id;
        this.url = post.url;
        if (post.likes) {
            this.likes = post.likes;
        } else {
            this.likes = null;
        }
        this.likes = post.likes;
        this.texto = post.texto;
        this.usuario = post.usuario;
        this.fechaPublicacion = post.fechaPublicacion;

        if (post.filePosts) {
            const fileArray: File[] = [];

            post.filePosts.map(file => {
                const ab = decode(file.file).buffer; // convierte el base64 string en uint8array que se pasa a arraybuffer

                fileArray.push(new File([ab], 'archivo', { type: file.fileContentType }));
            });

            this.demoForm.controls['files'].setValue(fileArray);
        } else {
            this.filePost = null;
            this.demoForm.controls['files'].setValue(null);
        }
    }
}
