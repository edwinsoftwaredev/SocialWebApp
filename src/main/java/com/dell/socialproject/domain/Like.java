package com.dell.socialproject.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * A Like.
 */
@Entity
@Table(name = "tbl_sp_like")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Like implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_like")
    private LocalDateTime fechaLike; // Cambiar el tipo de dato de esta propiedad en la base

    @ManyToOne
    @JsonIgnoreProperties("likes")  // para mejorar dejar en @JsonIgnore y asi la entidad post puede traer todos los likes
    private Post post;

    @ManyToOne
    @JsonIgnoreProperties("usuarioLikes")
    private Usuario usuarioLike;  // En My SQL el campo BIGINT(20) debe de ser NOT NULL para poder ser mapeado como LONG en JAVA

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getFechaLike() {
        return fechaLike.plusHours(6);
    }

    public Like fechaLike(LocalDateTime fechaLike) {
        this.fechaLike = fechaLike;
        return this;
    }

    public void setFechaLike(LocalDateTime fechaLike) {
        this.fechaLike = fechaLike.minusHours(6);
    }

    public Post getPost() {
        return post;
    }

    public Like post(Post post) {
        this.post = post;
        return this;
    }

    public void setPost(Post post) {
        this.post = post;
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
        Like like = (Like) o;
        if (like.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), like.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Like{" +
            "id=" + getId() +
            ", fechaLike='" + getFechaLike() + "'" +
            "}";
    }

    public Usuario getUsuarioLike() {
        return usuarioLike;
    }

    public void setUsuarioLike(Usuario usuarioLike) {
        this.usuarioLike = usuarioLike;
    }

    public Like usuarioLike(Usuario usuarioLike) {
        this.usuarioLike = usuarioLike;
        return this;
    }
}
