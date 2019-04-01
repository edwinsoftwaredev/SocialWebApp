package com.dell.socialproject.repository;

import com.dell.socialproject.domain.Relacion;
import com.dell.socialproject.domain.Usuario;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


/**
 * Spring Data  repository for the Relacion entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RelacionRepository extends JpaRepository<Relacion, Long> {

    List<Relacion> findAllByUsuario_Usuario(@Param("usuario") String usuario);

    List<Relacion> findAllByUsuario_Id(@Param("idUsuario") Long idUsuario);

    Optional<Relacion> findAllByUsuario_UsuarioAndAmigoId(@Param("usuario") String usuario, @Param("amigoId") Long amigoId);

    List<Relacion> findAllByAmigoId(@Param("usuarioId") Long usuarioId);

    Optional<Relacion> findByAmigoIdAndUsuario_Id(@Param("amigoId") Long amigoId, @Param("usuarioId") Long usuarioId);

    @Transactional
    void deleteByUsuario_IdAndAmigoId(@Param("usuarioId") Long usuarioId, @Param("amigoId") Long amigoId);

    @Transactional
    void deleteAllByUsuario(@Param("usuarioId") Usuario usuario);

    @Transactional
    void deleteAllByAmigoId(@Param("amigoId") Long amigoId);

}
