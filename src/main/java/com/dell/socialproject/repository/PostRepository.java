package com.dell.socialproject.repository;

import com.dell.socialproject.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Post entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("select a from Post a where a.usuario.usuario =:usuario")
    List<Post> findAllByUsuario_Usuario(@Param("usuario") String usuario);

    @Query("select a from Post a left join fetch a.filePosts where a.usuario.usuario = :usuario")
    List<Post> findAllPostWithPostFilesByUsuario_Usuario(@Param("usuario") String usuario);

    @Query("select a from Post a left join fetch a.likes where a.usuario.usuario = :usuario")
    List<Post> findAllPostWithPostLikesByUsuario_Usuario(@Param("usuario") String usuario);

    @Query("select distinct a from Post a left join fetch a.filePosts where a.usuario.id in (:listaAmigos) order by a.fechaPublicacion desc, a.id desc")
    List<Post> findAllPostsForWallWithPostFiles(@Param("listaAmigos") List<Long> listaAmigos);

    @Query("select distinct a from Post a left join fetch a.likes where a.usuario.id in (:listaAmigos) order by a.fechaPublicacion, a.id desc")
    List<Post> findAllPostForWallWithLikes(@Param("listaAmigos") List<Long> listaAmigos);

    // se agrega el parametro countQuery para lograr hacer la paginacion

    @Query(value = "select distinct a from Post a left join fetch a.filePosts where a.usuario.id in (:listaAmigos)",
        countQuery = "select count(distinct a) from Post a where a.usuario.id in (:listaAmigos)")
    Page<Post> findAllPostsForWallWithPostFilesPageable(@Param("listaAmigos") List<Long> listaAmigos, Pageable pageable);

    @Query(value = "select distinct a from Post a left join fetch a.likes where a.usuario.id in (:listaAmigos)",
        countQuery = "select count(distinct a) from Post a where a.usuario.id in (:listaAmigos)")
    Page<Post> findAllPostForWallWithLikesPageable(@Param("listaAmigos") List<Long> listaAmigos, Pageable pageable);

    // para perfil visitado

    @Query(value = "select distinct a from Post a left join fetch a.filePosts where a.usuario.id = :idUsuario",
        countQuery = "select count(distinct a) from Post a where a.usuario.id = :idUsuario")
    Page<Post> findAllPostsForWallWithPostFilesPageableVisited(@Param("idUsuario") Long idUsuario, Pageable pageable);

    @Query(value = "select distinct a from Post a left join fetch a.likes where a.usuario.id = :idUsuario",
        countQuery = "select count(distinct a) from Post a where a.usuario.id = :idUsuario")
    Page<Post> findAllPostForWallWithLikesPageableVisited(@Param("idUsuario") Long idUsuario, Pageable pageable);

    @Query("select distinct a from Post a left join fetch a.likes where a.usuario.id = :idUsuario")
    List<Post> findAllPostWithLikesByUsuario_Id(@Param("idUsuario") Long idUsuario);

    @Transactional
    void deleteAllByIdIn(@Param("listadoId") List<Long> listadoId);

    @Query("select a from Post a left join fetch a.likes where a.id = :id")
    Optional<Post> findByIdWithLikes(@Param("id") Long id);

}
