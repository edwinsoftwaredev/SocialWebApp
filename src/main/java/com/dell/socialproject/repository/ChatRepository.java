package com.dell.socialproject.repository;

import com.dell.socialproject.domain.Chat;
import com.dell.socialproject.domain.Usuario;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.List;
import java.util.Optional;
import java.util.Set;


/**
 * Spring Data  repository for the Chat entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {


    /*
        select d
        from Document d
        where d.name = :name
        and d.version = (select max(d.version) from Document d where d.name = :name)
    */

    @Query(nativeQuery = true, value = "select chats_id from usuario_chat where usuarios_id = :usuarioId1 or usuarios_id = :usuarioId2 group by chats_id having count(chats_id) > 1")
    Optional<BigInteger> getChatId(@Param("usuarioId1") long usuarioId1, @Param("usuarioId2") long usuarioId2);

    @Query("select a from Chat a where a.usuarios in (:listadoUsuarios) group by a.id having count(a.id) > 1")
    Optional<Long> getChatByListadoUsuarios(@Param("listadoUsuarios") List<Usuario> listadoUsuarios);

    List<Chat> findAllByUsuarios(@Param("usuario") Usuario usuario);

    // ver joins
    // obtenemos usuario, luego los chat de esos usuarios
    @Query("select a from Chat a left join fetch a.usuarios b left join fetch b.chats where a.id = :id")
    Optional<Chat> getChatByIdWithUsers(@Param("id") Long id);

    @Transactional
    void deleteAllByIdIn(@Param("listadoId") List<Long> listadoId);

}
