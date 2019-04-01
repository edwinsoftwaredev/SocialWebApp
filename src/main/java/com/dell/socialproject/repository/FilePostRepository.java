package com.dell.socialproject.repository;

import com.dell.socialproject.domain.FilePost;
import com.dell.socialproject.domain.Post;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Spring Data  repository for the FilePost entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FilePostRepository extends JpaRepository<FilePost, Long> {

    @Transactional
    void deleteAllByPost_Id(@Param("postId") Long postId);

    @Transactional
    void deleteAllByPostIn(@Param("listadoPost") List<Post> listadoPost);
}
