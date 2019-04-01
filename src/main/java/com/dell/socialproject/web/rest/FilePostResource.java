package com.dell.socialproject.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.dell.socialproject.domain.FilePost;
import com.dell.socialproject.repository.FilePostRepository;
import com.dell.socialproject.web.rest.errors.BadRequestAlertException;
import com.dell.socialproject.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing FilePost.
 */
@RestController
@RequestMapping("/api")
public class FilePostResource {

    private final Logger log = LoggerFactory.getLogger(FilePostResource.class);

    private static final String ENTITY_NAME = "filePost";

    private final FilePostRepository filePostRepository;

    public FilePostResource(FilePostRepository filePostRepository) {
        this.filePostRepository = filePostRepository;
    }

    /**
     * POST  /file-posts : Create a new filePost.
     *
     * @param filePost the filePost to create
     * @return the ResponseEntity with status 201 (Created) and with body the new filePost, or with status 400 (Bad Request) if the filePost has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/file-posts")
    @Timed
    public ResponseEntity<FilePost> createFilePost(@RequestBody FilePost filePost) throws URISyntaxException {
        log.debug("REST request to save FilePost : {}", filePost);
        if (filePost.getId() != null) {
            throw new BadRequestAlertException("A new filePost cannot already have an ID", ENTITY_NAME, "idexists");
        }
        FilePost result = filePostRepository.save(filePost);
        return ResponseEntity.created(new URI("/api/file-posts/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /file-posts : Updates an existing filePost.
     *
     * @param filePost the filePost to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated filePost,
     * or with status 400 (Bad Request) if the filePost is not valid,
     * or with status 500 (Internal Server Error) if the filePost couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/file-posts")
    @Timed
    public ResponseEntity<FilePost> updateFilePost(@RequestBody FilePost filePost) throws URISyntaxException {
        log.debug("REST request to update FilePost : {}", filePost);
        if (filePost.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        FilePost result = filePostRepository.save(filePost);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, filePost.getId().toString()))
            .body(result);
    }

    /**
     * GET  /file-posts : get all the filePosts.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of filePosts in body
     */
    @GetMapping("/file-posts")
    @Timed
    public List<FilePost> getAllFilePosts() {
        log.debug("REST request to get all FilePosts");
        return filePostRepository.findAll();
    }

    /**
     * GET  /file-posts/:id : get the "id" filePost.
     *
     * @param id the id of the filePost to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the filePost, or with status 404 (Not Found)
     */
    @GetMapping("/file-posts/{id}")
    @Timed
    public ResponseEntity<FilePost> getFilePost(@PathVariable Long id) {
        log.debug("REST request to get FilePost : {}", id);
        Optional<FilePost> filePost = filePostRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(filePost);
    }

    /**
     * DELETE  /file-posts/:id : delete the "id" filePost.
     *
     * @param id the id of the filePost to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/file-posts/{id}")
    @Timed
    public ResponseEntity<Void> deleteFilePost(@PathVariable Long id) {
        log.debug("REST request to delete FilePost : {}", id);

        filePostRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    // Elimina todos los archivos dado el post id 
    @DeleteMapping("/file-posts/post/{id}")
    @Timed
    public ResponseEntity<Void> deleteFilesByPost(@PathVariable Long id) {
        log.debug("REST request to delete FilePost : {}", id);
        filePostRepository.deleteAllByPost_Id(id);

        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
