package com.dell.socialproject.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A Post.
 */
@Entity
@Table(name = "tbl_sp_post")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Post implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "texto")
    private String texto;

    @Column(name = "url")
    private String url;

    @Column(name = "fecha_publicacion")
    private LocalDateTime fechaPublicacion; // cambiar en la base datos el tipo de campos de esta propiedad para no generar errores

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE)
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<FilePost> filePosts = new HashSet<>();
    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE)
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Like> likes = new HashSet<>();
    @ManyToOne
    @JsonIgnoreProperties("posts")
    private Usuario usuario;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTexto() {
        return texto;
    }

    public Post texto(String texto) {
        this.texto = texto;
        return this;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public String getUrl() {
        return url;
    }

    public Post url(String url) {
        this.url = url;
        return this;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public LocalDateTime getFechaPublicacion() {
        return fechaPublicacion.plusHours(6);
    }

    public Post fechaPublicacion(LocalDateTime fechaPublicacion) {
        this.fechaPublicacion = fechaPublicacion;
        return this;
    }

    public void setFechaPublicacion(LocalDateTime fechaPublicacion) {
        this.fechaPublicacion = fechaPublicacion.minusHours(6);
    }

    public Set<FilePost> getFilePosts() {
        return filePosts;
    }

    public Post filePosts(Set<FilePost> filePosts) {
        this.filePosts = filePosts;
        return this;
    }

    public Post addFilePost(FilePost filePost) {
        this.filePosts.add(filePost);
        filePost.setPost(this);
        return this;
    }

    public Post removeFilePost(FilePost filePost) {
        this.filePosts.remove(filePost);
        filePost.setPost(null);
        return this;
    }

    public void setFilePosts(Set<FilePost> filePosts) {
        this.filePosts = filePosts;
    }

    public Set<Like> getLikes() {
        return likes;
    }

    public Post likes(Set<Like> likes) {
        this.likes = likes;
        return this;
    }

    public Post addLike(Like like) {
        this.likes.add(like);
        like.setPost(this);
        return this;
    }

    public Post removeLike(Like like) {
        this.likes.remove(like);
        like.setPost(null);
        return this;
    }

    public void setLikes(Set<Like> likes) {
        this.likes = likes;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public Post usuario(Usuario usuario) {
        this.usuario = usuario;
        return this;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Post post = (Post) o;
        if (post.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), post.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Post{" +
            "id=" + getId() +
            ", texto='" + getTexto() + "'" +
            ", url='" + getUrl() + "'" +
            ", fechaPublicacion='" + getFechaPublicacion() + "'" +
            "}";
    }
}
