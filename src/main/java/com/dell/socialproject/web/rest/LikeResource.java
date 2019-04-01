package com.dell.socialproject.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.dell.socialproject.domain.Like;
import com.dell.socialproject.domain.Post;
import com.dell.socialproject.repository.LikeRepository;
import com.dell.socialproject.repository.PostRepository;
import com.dell.socialproject.web.rest.errors.BadRequestAlertException;
import com.dell.socialproject.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.swing.text.html.Option;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Like.
 */
@RestController
@RequestMapping("/api")
public class LikeResource {

    private final Logger log = LoggerFactory.getLogger(LikeResource.class);

    private static final String ENTITY_NAME = "like";

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;

    public LikeResource(LikeRepository likeRepository,
                        PostRepository postRepository) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
    }

    /**
     * POST  /likes : Create a new like.
     *
     * @param like the like to create
     * @return the ResponseEntity with status 201 (Created) and with body the new like, or with status 400 (Bad Request) if the like has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/likes")
    @Timed
    public ResponseEntity<Like> createLike(@RequestBody Like like) throws URISyntaxException {
        log.debug("REST request to save Like : {}", like);
        if(like.getId() != null) {
            throw new BadRequestAlertException("A new like cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Like result = likeRepository.save(like);

        // lo siguiente es por que cuando se cargan los post y luego se da un like
        // la instancia post no tiene asignado ese like por lo que se tiene que asignarse
        // esto permite que al momento de eliminar el post despues de haber sido cargado y dar like
        // no se presenten errores de referencia

        // ojo que la tiene la anotacion @Transactional esto permite realizar este tipo de operaciones
        // a las instacias de las entidades

        Optional<Like> likeWithPost = this.likeRepository.findByIdWithPost(result.getId());

        if (likeWithPost.isPresent()) {
            Optional<Post> post = this.postRepository.findByIdWithLikes(likeWithPost.get().getPost().getId());

            if(post.isPresent()) {
                post.get().addLike(result);
            }

        }

        return ResponseEntity.created(new URI("/api/likes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /likes : Updates an existing like.
     *
     * @param like the like to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated like,
     * or with status 400 (Bad Request) if the like is not valid,
     * or with status 500 (Internal Server Error) if the like couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/likes")
    @Timed
    public ResponseEntity<Like> updateLike(@RequestBody Like like) throws URISyntaxException {
        log.debug("REST request to update Like : {}", like);
        if(like.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Like result = likeRepository.save(like);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, like.getId().toString()))
            .body(result);
    }

    /**
     * GET  /likes : get all the likes.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of likes in body
     */
    @GetMapping("/likes")
    @Timed
    public List<Like> getAllLikes() {
        log.debug("REST request to get all Likes");
        return likeRepository.findAll();
    }

    /**
     * GET  /likes/:id : get the "id" like.
     *
     * @param id the id of the like to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the like, or with status 404 (Not Found)
     */
    @GetMapping("/likes/{id}")
    @Timed
    public ResponseEntity<Like> getLike(@PathVariable Long id) {
        log.debug("REST request to get Like : {}", id);
        Optional<Like> like = likeRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(like);
    }

    /**
     * DELETE  /likes/:id : delete the "id" like.
     *
     * @param id the id of the like to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/likes/{id}")
    @Timed
    @Transactional
    public ResponseEntity<Void> deleteLike(@PathVariable Long id) {
        log.debug("REST request to delete Like : {}", id);

        Optional<Like> like = this.likeRepository.findByIdWithPost(id);

        // al eliminar un like la instancia post que es dueña de la instancia like
        // aun conserva relacion con esa instancia like
        // por lo que al simplemente solo eliminar el like y luego querer eliminar el post
        // se produce un error ya que no se encuentra el instancia de ese like

        // POR LO QUE hay que obtener esa instacia post que es dueña del like y eliminarla
        // del post. luego al like dejar una referencia a post como null es decir una referencia
        // a nada.

        // ojo que el metodo es @Transactional y tiene que serlo para realizar estas operaciones

        if (like.isPresent()) {

            Post post = like.get().getPost();

            post.removeLike(like.get());

            like.get().setPost(null);

            likeRepository.deleteById(id);

            return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
