package com.dell.socialproject.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.dell.socialproject.config.MessageDTO;
import com.dell.socialproject.domain.Chat;
import com.dell.socialproject.domain.Mensaje;
import com.dell.socialproject.domain.Usuario;
import com.dell.socialproject.repository.ChatRepository;
import com.dell.socialproject.repository.MensajeRepository;
import com.dell.socialproject.repository.UsuarioRepository;
import com.dell.socialproject.web.rest.errors.BadRequestAlertException;
import com.dell.socialproject.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * REST controller for managing Chat.
 */
@RestController
@RequestMapping("/api")
public class ChatResource {

    private final Logger log = LoggerFactory.getLogger(ChatResource.class);

    private static final String ENTITY_NAME = "chat";

    private final ChatRepository chatRepository;
    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    SimpMessagingTemplate simpMessagingTemplate;

    public ChatResource(ChatRepository chatRepository,
                        MensajeRepository mensajeRepository,
                        UsuarioRepository usuarioRepository) {
        this.chatRepository = chatRepository;
        this.mensajeRepository = mensajeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * POST  /chats : Create a new chat.
     *
     * @param chat the chat to create
     * @return the ResponseEntity with status 201 (Created) and with body the new chat, or with status 400 (Bad Request) if the chat has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/chats")
    @Timed
    public ResponseEntity<Chat> createChat(@RequestBody Chat chat) throws URISyntaxException {
        log.debug("REST request to save Chat : {}", chat);
        if (chat.getId() != null) {
            throw new BadRequestAlertException("A new chat cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Chat result = chatRepository.save(chat);
        return ResponseEntity.created(new URI("/api/chats/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /chats : Updates an existing chat.
     *
     * @param chat the chat to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated chat,
     * or with status 400 (Bad Request) if the chat is not valid,
     * or with status 500 (Internal Server Error) if the chat couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/chats")
    @Timed
    public ResponseEntity<Chat> updateChat(@RequestBody Chat chat) throws URISyntaxException {
        log.debug("REST request to update Chat : {}", chat);
        if (chat.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Chat result = chatRepository.save(chat);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, chat.getId().toString()))
            .body(result);
    }

    /**
     * GET  /chats : get all the chats.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of chats in body
     */
    @GetMapping("/chats")
    @Timed
    public List<Chat> getAllChats() {
        log.debug("REST request to get all Chats");
        return chatRepository.findAll();
    }

    /**
     * GET  /chats/:id : get the "id" chat.
     *
     * @param id the id of the chat to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the chat, or with status 404 (Not Found)
     */
    @GetMapping("/chats/{id}")
    @Timed
    public ResponseEntity<Chat> getChat(@PathVariable Long id) {
        log.debug("REST request to get Chat : {}", id);
        Optional<Chat> chat = chatRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(chat);
    }

    // se usa esta anotacion ya que hay valores que no forman parte de una entidad como Usuario en las consultas que
    // se hace a la base ver linea 133 que es una consulta nativa.
    // Tambien se usa si SE CREAN OBJETOS APARTIR DE ENTIDADES, ejemplo: Usuario x = new Usuario;
    // y luego se guarda en la base haciendo uso de de uno de los repositorios
    // lo que sucedera es que luego ese objeto no sera recuperado de la base ya que no es una entidad realmente
    // y solo forma parte de la transaccion actual, es decir, luego no puede ser recuperado por otra transaccion
    // como recuperar todos los usuarios de la entidad Usuario

    @GetMapping(value = "/chats/mensajesGuardados1", params = {"usuarioId1", "usuarioId2"})
    @Timed
    public List<MessageDTO> getAllMessageByUsuarioId(@RequestParam("usuarioId1") Long usuarioId1,
                                                     @RequestParam("usuarioId2") Long usuarioId2) {
        log.debug("REST request to get all message by usuario");

        List<MessageDTO> messageDTOS = new ArrayList<>();

        if(this.usuarioRepository.findByUsuario_IdWithChats(usuarioId1).isPresent()) {
            Usuario usuario = this.usuarioRepository.findByUsuario_IdWithChats(usuarioId1).get();

            Set<Chat> usuarioChats = usuario.getChats();

            List<Chat> chatActualLista = usuarioChats.stream().filter(chat -> {
                chat.getUsuarios().stream().filter(usuario1 -> {
                    // si fuesen chat grupales el cliente debe tener su lista de chats con los usuario en ese chat
                    if(usuario1.getId() == usuarioId2) {
                        return true;
                    }
                    return false;
                });
                return false;
            }).collect(Collectors.toList());

            this.log.debug(chatActualLista.size() + "Tamaño de la lista");

            Chat chatActual = chatActualLista.get(0);

            messageDTOS = chatActual.getMensajes().stream().map(mensaje -> {

                return new MessageDTO(mensaje.getUsuario(),
                    mensaje.getTexto(),
                    "MESAJESGUARDADOS",
                    mensaje.getFechaCreacion(),
                    false,
                    false,
                    false,
                    false,
                    mensaje.getChat(),
                    mensaje);

            }).collect(Collectors.toList());
        }

        return messageDTOS;
    }

    /**
     * DELETE  /chats/:id : delete the "id" chat.
     *
     * @param id the id of the chat to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/chats/{id}")
    @Timed
    @Transactional
    public ResponseEntity<Void> deleteChat(@PathVariable Long id) {
        log.debug("REST request to delete Chat : {}", id);

        // se obtiene el chat con sus usuarios y sus chats
        Optional<Chat> chat = this.chatRepository.getChatByIdWithUsers(id);

        if (chat.isPresent()) {

            // se envia mensaje para destruir chat a los usuarios conectados



            // se hace una copia sobre los elementos para no iterar sobre
            // los elementos cambiantes de la lista

            List<Usuario> listaUsuarios = new ArrayList<>(chat.get().getUsuarios());

            listaUsuarios.forEach(usuario -> {
                // se elimina el usuario del chat
                // Y elimina el chat del usuario

                this.simpMessagingTemplate.convertAndSendToUser(usuario.getUsuario(),
                    "/queue/specific-user",
                    new MessageDTO(usuario,
                        "DESTRUIR_CHAT_ID_" + chat.get().getId().toString(),
                        usuario.getUsuario(),
                        LocalDateTime.now(),
                        false,
                        false,
                        false,
                        false,
                        null,
                        null));

                chat.get().removeUsuario(usuario);
            });

            // se limpia la copia de la lista
            listaUsuarios.clear();

            // se guarda el chat sin usuario ligados a el
            // esto para eliminar las referencias de la tabla transaccional usuario_chat
            this.chatRepository.save(chat.get());

            // se elimina el chat de la tabla
            chatRepository.deleteById(id);
            return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();

        } else {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "not_found", "not found")).build();
        }

        /*chatRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();*/

    }
}
