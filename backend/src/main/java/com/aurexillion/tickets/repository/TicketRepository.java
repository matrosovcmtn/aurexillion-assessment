package com.aurexillion.tickets.repository;

import com.aurexillion.tickets.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    long countByStatusId(Long statusId);

    long countByAssigneeId(Long assigneeId);

    @Modifying
    @Query(value = "delete from ticket_tags where tag_id = :tagId", nativeQuery = true)
    void unlinkTag(@Param("tagId") Long tagId);
}
