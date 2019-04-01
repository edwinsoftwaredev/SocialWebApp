package com.dell.socialproject.repository;

import com.dell.socialproject.domain.Like;
import com.dell.socialproject.domain.Usuario;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;


/**
 * Spring Data  repository for the Like entity.
 */
@SuppressWarnings("unused")
@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    @Transactional
    void deleteAllByPost_Id(@Param("postId") Long postId);

    @Transactional
    void deleteAllByUsuarioLike_Id(@Param("usuarioLike") Long usuarioLike);

    @Query("select a from Like a left join fetch a.post where a.id = :id")
    Optional<Like> findByIdWithPost(@Param("id") Long id);
}
