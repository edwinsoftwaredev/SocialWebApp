package com.dell.socialproject.repository;

import com.dell.socialproject.domain.Chat;
import com.dell.socialproject.domain.Mensaje;
import com.dell.socialproject.domain.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;


/**
 * Spring Data  repository for the Mensaje entity.
 */
@SuppressWarnings("unused")
@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    @Query(value = "select distinct a from Mensaje a left join fetch a.chat left join fetch a.usuario where a.chat.id = :chatId",
    countQuery = "select count(distinct a) from Mensaje where a.chat.id = :chatId" )
    List<Mensaje> findAllMensajesByChatId(@Param("chatId") Long chatId, Pageable pageable);

    @Transactional
    void deleteAllByChatIn(@Param("chatList") List<Chat> chatList);
}
