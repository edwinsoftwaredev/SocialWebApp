package com.dell.socialproject.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A Relacion.
 */
@Entity
@Table(name = "tbl_sp_rel")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Relacion implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "amigo_id")
    private Long amigoId; // este campo debe de ser NOT NULL en MY SQL - BIGINT(20) NOT NULL

    @Column(name = "estado")
    private Boolean estado;

    @Column(name = "fecha")
    private LocalDate fecha;

    @ManyToOne
    @JsonIgnoreProperties("relacions")
    private Usuario usuario; // este campo debe de ser NOT NULL en MY SQL - BIGINT(20) NOT NULL

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAmigoId() {
        return amigoId;
    }

    public Relacion amigoId(Long amigoId) {
        this.amigoId = amigoId;
        return this;
    }

    public void setAmigoId(Long amigoId) {
        this.amigoId = amigoId;
    }

    public Boolean isEstado() {
        return estado;
    }

    public Relacion estado(Boolean estado) {
        this.estado = estado;
        return this;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public Relacion fecha(LocalDate fecha) {
        this.fecha = fecha;
        return this;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public Relacion usuario(Usuario usuario) {
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
        Relacion relacion = (Relacion) o;
        if (relacion.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), relacion.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Relacion{" +
            "id=" + getId() +
            ", amigoId=" + getAmigoId() +
            ", estado='" + isEstado() + "'" +
            ", fecha='" + getFecha() + "'" +
            "}";
    }
}
