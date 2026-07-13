package com.aurexillion.tickets.repository;

import com.aurexillion.tickets.model.Priority;
import com.aurexillion.tickets.model.Ticket;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class TicketSpecifications {

    private TicketSpecifications() {
    }

    public static Specification<Ticket> withFilters(
            String q,
            Long statusId,
            List<Priority> priorities,
            List<Long> tagIds,
            List<Long> assigneeIds,
            String code) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)));
            }

            if (statusId != null) {
                predicates.add(cb.equal(root.get("status").get("id"), statusId));
            }

            if (priorities != null && !priorities.isEmpty()) {
                predicates.add(root.get("priority").in(priorities));
            }

            if (assigneeIds != null && !assigneeIds.isEmpty()) {
                predicates.add(root.get("assignee").get("id").in(assigneeIds));
            }

            if (code != null && !code.isBlank()) {
                String pattern = "%" + code.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("code")), pattern));
            }

            if (tagIds != null && !tagIds.isEmpty()) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<Ticket> correlated = subquery.from(Ticket.class);
                subquery.select(correlated.get("id"));
                subquery.where(
                        cb.equal(correlated.get("id"), root.get("id")),
                        correlated.join("tags").get("id").in(tagIds));
                predicates.add(cb.exists(subquery));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
