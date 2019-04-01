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
 * A Chat.
 */
@Entity
@Table(name = "tbl_sp_chat")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Chat implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "ultima_vez_visto")
    private LocalDate ultimaVezVisto;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.REMOVE)
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Mensaje> mensajes = new HashSet<>();

    // se reemplazo jsoningnoreproperty('chats') por jsonignore
    // jsoningnoreproperty('chats') podia traer el chat con el usuario pero sin los chats del usuario para evitar recursion
    // jsonignore no trae el usuario del chat, para recuperar el chat hay que consultar al usuario que tiene el chat
    // ya que relacion es muchos a muchos

    @ManyToMany(mappedBy = "chats")
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JsonIgnoreProperties("chats")
    private Set<Usuario> usuarios = new HashSet<>();;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public Chat fechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
        return this;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDate getUltimaVezVisto() {
        return ultimaVezVisto;
    }

    public Chat ultimaVezVisto(LocalDate ultimaVezVisto) {
        this.ultimaVezVisto = ultimaVezVisto;
        return this;
    }

    public void setUltimaVezVisto(LocalDate ultimaVezVisto) {
        this.ultimaVezVisto = ultimaVezVisto;
    }

    public Set<Mensaje> getMensajes() {
        return mensajes;
    }

    public Chat mensajes(Set<Mensaje> mensajes) {
        this.mensajes = mensajes;
        return this;
    }

    public Chat addMensaje(Mensaje mensaje) {
        this.mensajes.add(mensaje);
        mensaje.setChat(this);
        return this;
    }

    public Chat removeMensaje(Mensaje mensaje) {
        this.mensajes.remove(mensaje);
        mensaje.setChat(null);
        return this;
    }

    public void setMensajes(Set<Mensaje> mensajes) {
        this.mensajes = mensajes;
    }

    /////////////////////////////////////////////////////////////////////////////

    public Set<Usuario> getUsuarios() {
        return usuarios;
    }

    public Chat usuarios(Set<Usuario> usuarios) {
        this.usuarios = usuarios;
        return this;
    }

    public Chat addUsuario(Usuario usuario) {
        this.usuarios.add(usuario);
        usuario.getChats().add(this);
        return this;
    }

    public Chat removeUsuario(Usuario usuario) {
        this.usuarios.remove(usuario);
        usuario.getChats().remove(this);
        return this;
    }

    public void setUsuarios(Set<Usuario> usuarios) {
        this.usuarios = usuarios;
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
        Chat chat = (Chat) o;
        if (chat.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), chat.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Chat{" +
            "id=" + getId() +
            ", fechaCreacion='" + getFechaCreacion() + "'" +
            ", ultimaVezVisto='" + getUltimaVezVisto() + "'" +
            "}";
    }
}
