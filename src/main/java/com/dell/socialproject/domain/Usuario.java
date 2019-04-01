package com.dell.socialproject.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A Usuario.
 */
@Entity
@Table(name = "tbl_sp_usuario")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Usuario implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario")
    private String usuario;

    @Column(name = "primer_nombre")
    private String primerNombre;

    @Column(name = "segundo_nombre")
    private String segundoNombre;

    @Column(name = "primer_apellido")
    private String primerApellido;

    @Column(name = "segundo_apellido")
    private String segundoApellido;

    @Column(name = "email")
    private String email;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @Lob
    @Column(name = "profile_pic")
    private byte[] profilePic;

    @Column(name = "profile_pic_content_type")
    private String profilePicContentType;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.REMOVE)
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Relacion> relacions = new HashSet<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.REMOVE)
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Post> posts = new HashSet<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.REMOVE)
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Mensaje> mensajes = new HashSet<>();

    @OneToMany(mappedBy = "usuarioLike", cascade = CascadeType.REMOVE)
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Like> likes = new HashSet<>();

    // en relaciones many to many es recomendable usuario el tipo de cascade siguiente:
    // cascade = {CascadeType.PERSIST, CascadeType.MERGE}
    // en lugar de CascadeType.ALL o CascadeType.Remove
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(
        name = "usuario_chat",
        joinColumns = @JoinColumn(name = "usuarios_id", referencedColumnName = "id"),
        inverseJoinColumns = @JoinColumn(name = "chats_id", referencedColumnName = "id")
    )
    private Set<Chat> chats = new HashSet<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "usuario_actividad",
               joinColumns = @JoinColumn(name = "usuarios_id", referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "actividads_id", referencedColumnName = "id"))
    private Set<Actividad> actividads = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsuario() {
        return usuario;
    }

    public Usuario usuario(String usuario) {
        this.usuario = usuario;
        return this;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getPrimerNombre() {
        return primerNombre;
    }

    public Usuario primerNombre(String primerNombre) {
        this.primerNombre = primerNombre;
        return this;
    }

    public void setPrimerNombre(String primerNombre) {
        this.primerNombre = primerNombre;
    }

    public String getSegundoNombre() {
        return segundoNombre;
    }

    public Usuario segundoNombre(String segundoNombre) {
        this.segundoNombre = segundoNombre;
        return this;
    }

    public void setSegundoNombre(String segundoNombre) {
        this.segundoNombre = segundoNombre;
    }

    public String getPrimerApellido() {
        return primerApellido;
    }

    public Usuario primerApellido(String primerApellido) {
        this.primerApellido = primerApellido;
        return this;
    }

    public void setPrimerApellido(String primerApellido) {
        this.primerApellido = primerApellido;
    }

    public String getSegundoApellido() {
        return segundoApellido;
    }

    public Usuario segundoApellido(String segundoApellido) {
        this.segundoApellido = segundoApellido;
        return this;
    }

    public void setSegundoApellido(String segundoApellido) {
        this.segundoApellido = segundoApellido;
    }

    public String getEmail() {
        return email;
    }

    public Usuario email(String email) {
        this.email = email;
        return this;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public Usuario fechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
        return this;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public Usuario fechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
        return this;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public byte[] getProfilePic() {
        return profilePic;
    }

    public Usuario profilePic(byte[] profilePic) {
        this.profilePic = profilePic;
        return this;
    }

    public void setProfilePic(byte[] profilePic) {
        this.profilePic = profilePic;
    }

    public String getProfilePicContentType() {
        return profilePicContentType;
    }

    public Usuario profilePicContentType(String profilePicContentType) {
        this.profilePicContentType = profilePicContentType;
        return this;
    }

    public void setProfilePicContentType(String profilePicContentType) {
        this.profilePicContentType = profilePicContentType;
    }

    public Set<Relacion> getRelacions() {
        return relacions;
    }

    public Usuario relacions(Set<Relacion> relacions) {
        this.relacions = relacions;
        return this;
    }

    public Usuario addRelacion(Relacion relacion) {
        this.relacions.add(relacion);
        relacion.setUsuario(this);
        return this;
    }

    public Usuario removeRelacion(Relacion relacion) {
        this.relacions.remove(relacion);
        relacion.setUsuario(null);
        return this;
    }

    public void setRelacions(Set<Relacion> relacions) {
        this.relacions = relacions;
    }

    public Set<Post> getPosts() {
        return posts;
    }

    public Usuario posts(Set<Post> posts) {
        this.posts = posts;
        return this;
    }

    public Usuario addPost(Post post) {
        this.posts.add(post);
        post.setUsuario(this);
        return this;
    }

    public Usuario removePost(Post post) {
        this.posts.remove(post);
        post.setUsuario(null);
        return this;
    }

    public void setPosts(Set<Post> posts) {
        this.posts = posts;
    }

    public Set<Mensaje> getMensajes() {
        return mensajes;
    }

    public Usuario mensajes(Set<Mensaje> mensajes) {
        this.mensajes = mensajes;
        return this;
    }

    public Usuario addMensaje(Mensaje mensaje) {
        this.mensajes.add(mensaje);
        mensaje.setUsuario(this);
        return this;
    }


    public Usuario removeMensaje(Mensaje mensaje) {
        this.mensajes.remove(mensaje);
        mensaje.setUsuario(null);
        return this;
    }

    public void setMensajes(Set<Mensaje> mensajes) {
        this.mensajes = mensajes;
    }

    ///////////////////////////////////////////////////////////////////////////

    public Set<Like> getLikes() {
        return likes;
    }

    public Usuario likes(Set<Like> likes) {
        this.likes = likes;
        return this;
    }

    public Usuario addLikes(Like like) {
        this.likes.add(like);
        like.setUsuarioLike(this);
        return this;
    }


    public Usuario removeLike(Like like) {
        this.likes.remove(like);
        like.setUsuarioLike(null);
        return this;
    }

    public void setLikes(Set<Like> likes) {
        this.likes = likes;
    }

    /////////////////////////////////////////////////////////////////////////////

    public Set<Chat> getChats() {
        return chats;
    }

    public Usuario chats(Set<Chat> chats) {
        this.chats = chats;
        return this;
    }

    public Usuario addChat(Chat chat) {
        this.chats.add(chat);
        chat.getUsuarios().add(this);
        return this;
    }

    public Usuario removeChat(Chat chat) {
        this.chats.remove(chat);
        chat.getUsuarios().remove(this);  // si un usuario borra el chat el otro aun puede ver el chat
        return this;
    }

    public void setChats(Set<Chat> chats) {
        this.chats = chats;
    }

    public Set<Actividad> getActividads() {
        return actividads;
    }

    public Usuario actividads(Set<Actividad> actividads) {
        this.actividads = actividads;
        return this;
    }

    public Usuario addActividad(Actividad actividad) {
        this.actividads.add(actividad);
        actividad.getUsuarios().add(this);
        return this;
    }

    public Usuario removeActividad(Actividad actividad) {
        this.actividads.remove(actividad);
        actividad.getUsuarios().remove(this);
        return this;
    }

    public void setActividads(Set<Actividad> actividads) {
        this.actividads = actividads;
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
        Usuario usuario = (Usuario) o;
        if (usuario.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), usuario.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Usuario{" +
            "id=" + getId() +
            ", usuario='" + getUsuario() + "'" +
            ", primerNombre='" + getPrimerNombre() + "'" +
            ", segundoNombre='" + getSegundoNombre() + "'" +
            ", primerApellido='" + getPrimerApellido() + "'" +
            ", segundoApellido='" + getSegundoApellido() + "'" +
            ", email='" + getEmail() + "'" +
            ", fechaNacimiento='" + getFechaNacimiento() + "'" +
            ", fechaRegistro='" + getFechaRegistro() + "'" +
            ", profilePic='" + getProfilePic() + "'" +
            ", profilePicContentType='" + getProfilePicContentType() + "'" +
            "}";
    }
}
