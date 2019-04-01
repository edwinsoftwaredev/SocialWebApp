package com.dell.socialproject.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.dell.socialproject.domain.Post;
import com.dell.socialproject.domain.Relacion;
import com.dell.socialproject.repository.FilePostRepository;
import com.dell.socialproject.repository.LikeRepository;
import com.dell.socialproject.repository.PostRepository;
import com.dell.socialproject.repository.RelacionRepository;
import com.dell.socialproject.web.rest.errors.BadRequestAlertException;
import com.dell.socialproject.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing Post.
 */
@RestController
@RequestMapping("/api")
public class PostResource {

    private final Logger log = LoggerFactory.getLogger(PostResource.class);

    private static final String ENTITY_NAME = "post";

    private final PostRepository postRepository;
    private final RelacionRepository relacionRepository;
    private final LikeRepository likeRepository;
    private final FilePostRepository filePostRepository;

    public PostResource(PostRepository postRepository,
                        RelacionRepository relacionRepository,
                        LikeRepository likeRepository,
                        FilePostRepository filePostRepository) {
        this.postRepository = postRepository;
        this.relacionRepository = relacionRepository;
        this.likeRepository = likeRepository;
        this.filePostRepository = filePostRepository;
    }

    /**
     * POST  /posts : Create a new post.
     *
     * @param post the post to create
     * @return the ResponseEntity with status 201 (Created) and with body the new post, or with status 400 (Bad Request) if the post has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/posts")
    @Timed
    public ResponseEntity<Post> createPost(@RequestBody Post post) throws URISyntaxException {
        log.debug("REST request to save Post : {}", post);
        if (post.getId() != null) {
            throw new BadRequestAlertException("A new post cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Post result = postRepository.save(post);
        return ResponseEntity.created(new URI("/api/posts/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /posts : Updates an existing post.
     *
     * @param post the post to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated post,
     * or with status 400 (Bad Request) if the post is not valid,
     * or with status 500 (Internal Server Error) if the post couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/posts")
    @Timed
    public ResponseEntity<Post> updatePost(@RequestBody Post post) throws URISyntaxException {
        log.debug("REST request to update Post : {}", post);
        if (post.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Post result = postRepository.save(post);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, post.getId().toString()))
            .body(result);
    }

    /**
     * GET  /posts : get all the posts.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of posts in body
     */
    @GetMapping("/posts")
    @Timed
    public List<Post> getAllPosts() {
        log.debug("REST request to get all Posts");
        return postRepository.findAll();
    }

    @GetMapping("/posts/muro/{usuario}")
    @Timed
    public List<Post> getAllPostsByUsuario(@PathVariable String usuario) {
        log.debug("REST request to get all Posts : {}", usuario);
        return this.postRepository.findAllByUsuario_Usuario(usuario);
    }

    /*@GetMapping("/posts/muro/postwall-files/{idUsuario}")
    @Timed
    public  List<Post> getPostWallWithFilesByUsuario(@PathVariable Long idUsuario) {

        List<Relacion> listaUsuarioPostWall = this.relacionRepository.findAllByUsuario_Id(idUsuario);

        listaUsuarioPostWall = listaUsuarioPostWall
            .stream()
            .filter(relacion -> relacion.isEstado() == true)
            .collect(Collectors.toList());

        List<Long> listaIdUsuariosPostWall;

        listaIdUsuariosPostWall = listaUsuarioPostWall
            .stream()
            .map(usuario -> usuario.getAmigoId())
            .collect(Collectors.toList());

        listaIdUsuariosPostWall.add(idUsuario);

        List<Post> listaPostWallWithFiles = this.postRepository
            .findAllPostsForWallWithPostFiles(listaIdUsuariosPostWall);

        List<Post> listaPostWallWithLikes = this.postRepository
            .findAllPostForWallWithLikes(listaIdUsuariosPostWall);

        List<Post> postWall = listaPostWallWithFiles
            .stream()
            .map(postFile -> {

                if(listaPostWallWithLikes
                    .stream()
                    .filter(postLike -> postLike.getId().equals(postFile.getId()))
                    .map(postLike -> postLike.getLikes())
                    .collect(Collectors.toList())
                    .size() != 0 ) {

                    postFile.setLikes(
                        listaPostWallWithLikes
                        .stream()
                        .filter(postLike -> postLike.getId().equals(postFile.getId()))
                        .map(postLike -> postLike.getLikes())
                        .collect(Collectors.toList())
                        .get(0)
                    );

                    return postFile;
                }
                else {

                    return postFile;
                }

            }).collect(Collectors.toList());

        return postWall;
    }*/

    @GetMapping(value = "/posts/muro/post-wall/pageable", params = {"idUsuario" ,"page", "size"})
    @Timed
    public List<Post> getPostWallByUsuarioPageable(@RequestParam("idUsuario") Long idUsuario,
                                                   @RequestParam("page") int page,
                                                   @RequestParam("size") int size) {
        List<Relacion> listaUsuarioPostWall = this.relacionRepository.findAllByUsuario_Id(idUsuario);

        listaUsuarioPostWall = listaUsuarioPostWall
            .stream()
            .filter(relacion -> relacion.isEstado() == true)
            .collect(Collectors.toList());

        List<Long> listaIdUsuariosPostWall;

        listaIdUsuariosPostWall = listaUsuarioPostWall
            .stream()
            .map(usuario -> usuario.getAmigoId())
            .collect(Collectors.toList());

        listaIdUsuariosPostWall.add(idUsuario);

        Page<Post> pagePostWallWithFiles = this.postRepository
            .findAllPostsForWallWithPostFilesPageable(listaIdUsuariosPostWall, PageRequest.of(page, size, Sort.Direction.DESC, "fechaPublicacion", "id"));

        Page<Post> pagePostWallWithLikes = this.postRepository
            .findAllPostForWallWithLikesPageable(listaIdUsuariosPostWall, PageRequest.of(page, size, Sort.Direction.DESC, "fechaPublicacion", "id"));

        List<Post> listaPostWallWithFiles = pagePostWallWithFiles.getContent();

        List<Post> listaPostWallWithLikes = pagePostWallWithLikes.getContent();

        List<Post> postWall = listaPostWallWithFiles
            .stream()
            .map(postFile -> {

                if(listaPostWallWithLikes
                    .stream()
                    .filter(postLike -> postLike.getId().equals(postFile.getId()))
                    .map(postLike -> postLike.getLikes())
                    .collect(Collectors.toList())
                    .size() != 0 ) {

                    postFile.setLikes(
                        listaPostWallWithLikes
                            .stream()
                            .filter(postLike -> postLike.getId().equals(postFile.getId()))
                            .map(postLike -> postLike.getLikes())
                            .collect(Collectors.toList())
                            .get(0)
                    );

                    return postFile;
                }
                else {

                    return postFile;
                }

            }).collect(Collectors.toList());

        return postWall;
    }

    @GetMapping(value = "/posts/muro/postvisitedprofile", params = {"idUsuario", "page", "size"}) 
    @Timed
    public List<Post> getPostWallVisitedProfile(@RequestParam("idUsuario") Long idUsuario,
                                                @RequestParam("page") int page,
                                                @RequestParam("size") int size) {

        log.debug("AVISO DE VISITA");
        log.debug(idUsuario.toString());
        log.debug(idUsuario + "");

        Page<Post> pagePostWallWithFiles = this.postRepository
            .findAllPostsForWallWithPostFilesPageableVisited(idUsuario, PageRequest.of(page, size, Sort.Direction.DESC, "fechaPublicacion", "id"));

        Page<Post> pagePostWallWithLikes = this.postRepository
            .findAllPostForWallWithLikesPageableVisited(idUsuario, PageRequest.of(page, size, Sort.Direction.DESC, "fechaPublicacion", "id"));

        List<Post> listaPostWallWithFiles = pagePostWallWithFiles.getContent();

        List<Post> listaPostWallWithLikes = pagePostWallWithLikes.getContent();

        List<Post> postWall = listaPostWallWithFiles
            .stream()
            .filter(postFile -> postFile.getUsuario().getId().equals(idUsuario))
            .map(postFile -> {

                if(listaPostWallWithLikes
                    .stream()
                    .filter(postLike -> postLike.getId().equals(postFile.getId()) && postLike.getUsuario().getId().equals(idUsuario))
                    .map(postLike -> postLike.getLikes())
                    .collect(Collectors.toList())
                    .size() != 0 ) {

                    postFile.setLikes(
                        listaPostWallWithLikes
                            .stream()
                            .filter(postLike -> postLike.getId().equals(postFile.getId()) && postLike.getUsuario().getId().equals(idUsuario))
                            .map(postLike -> postLike.getLikes())
                            .collect(Collectors.toList())
                            .get(0)
                    );

                    return postFile;
                }
                else {

                    return postFile;
                }

            }).collect(Collectors.toList());

        postWall.forEach(post -> {
            log.debug(post.getUsuario().getUsuario() + ": " + post.getTexto());
        });

        return postWall;
    }

    @GetMapping("/posts/muro/likes-usuario/{id}")
    @Timed
    public List<Post> getLikesUsuario(@PathVariable Long id) {
        log.debug("REST request to get likes de usuario: {}", id);
        return this.postRepository.findAllPostWithLikesByUsuario_Id(id);
    }

    /**
     * GET  /posts/:id : get the "id" post.
     *
     * @param id the id of the post to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the post, or with status 404 (Not Found)
     */
    @GetMapping("/posts/{id}")
    @Timed
    public ResponseEntity<Post> getPost(@PathVariable Long id) {
        log.debug("REST request to get Post : {}", id);
        Optional<Post> post = postRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(post);
    }

    /**
     * DELETE  /posts/:id : delete the "id" post.
     *
     * @param id the id of the post to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/posts/{id}")
    @Timed
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        log.debug("REST request to delete Post : {}", id);

        postRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    @DeleteMapping("/posts/full-post/{id}")
    @Timed
    public ResponseEntity<Void> deleteFullPost(@PathVariable Long id) {
        log.debug("REST request to delete full post: {}", id);

        // likeRepository.deleteAllByPost_Id(id);
        // filePostRepository.deleteAllByPost_Id(id);
        postRepository.deleteById(id);

        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
