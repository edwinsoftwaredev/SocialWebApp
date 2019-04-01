package com.dell.socialproject.repository;

import com.dell.socialproject.domain.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Spring Data  repository for the Usuario entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query(value = "select distinct tbl_sp_usuario from Usuario tbl_sp_usuario left join fetch tbl_sp_usuario.actividads",
        countQuery = "select count(distinct tbl_sp_usuario) from Usuario tbl_sp_usuario")
    Page<Usuario> findAllWithEagerRelationships(Pageable pageable);

    @Query(value = "select distinct tbl_sp_usuario from Usuario tbl_sp_usuario left join fetch tbl_sp_usuario.actividads")
    List<Usuario> findAllWithEagerRelationships();

    @Query("select tbl_sp_usuario from Usuario tbl_sp_usuario left join fetch tbl_sp_usuario.actividads where tbl_sp_usuario.id =:id")
    Optional<Usuario> findOneWithEagerRelationships(@Param("id") Long id);

    @Query("select a from Usuario a left join fetch a.actividads left join fetch a.chats where a.usuario = :usuario")
    Optional<Usuario> findByUsuario(@Param("usuario") String usuario);

    @Query("select a from Usuario  a left join fetch a.chats where a.usuario = :usuario")
    Optional<Usuario> findByUsuarioWithChats(@Param("usuario") String usuario);

    @Query("select a from Usuario a left join fetch a.chats b left join fetch b.usuarios where a.id = :usuarioId")
    Optional<Usuario> findByUsuario_IdWithChats(@Param("usuarioId") Long usuarioId);

    @Query("select a from Usuario a where a.usuario = :usuario")
    Optional<Usuario> findByUsuarioSinActividades(@Param("usuario") String usuario);

    @Query("select a from Usuario a where lower(concat(concat(concat(a.primerNombre, case when a.segundoNombre is null then '' else a.segundoNombre end), a.primerApellido), case when a.segundoApellido is null then '' else a.segundoApellido end)) like CONCAT(:searchString,'%')")
    List<Usuario> findAllBySearchString(@Param("searchString") String searchString); // Esto tiene que se paginado

    @Query("select distinct a from Usuario a where a.id in (:listaIdUsuarios) order by a.id")
    List<Usuario> findAllByUsuarioIdList(@Param("listaIdUsuarios") List<Long> listaIdUsuarios);

    @Query("select distinct a from Usuario a where a.id in (:listaIdUsuarios) order by a.id")
    Set<Usuario> findAllByUsuarioIdListSet(@Param("listaIdUsuarios") List<Long> listaIdUsuarios);
}
