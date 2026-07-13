package com.aurexillion.tickets.dto;

import com.aurexillion.tickets.model.Priority;
import com.aurexillion.tickets.model.Ticket;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record TicketResponse(
        Long id,
        String code,
        String title,
        String description,
        String customerName,
        String customerEmail,
        StatusResponse status,
        Priority priority,
        Instant deadline,
        AssigneeResponse assignee,
        List<TagResponse> tags,
        Instant createdAt
) {
    public static TicketResponse from(Ticket ticket) {
        List<TagResponse> tags = ticket.getTags() == null
                ? List.of()
                : ticket.getTags().stream()
                        .map(TagResponse::from)
                        .sorted(Comparator.comparing(TagResponse::name, String.CASE_INSENSITIVE_ORDER))
                        .toList();

        return new TicketResponse(
                ticket.getId(),
                ticket.getCode(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCustomerName(),
                ticket.getCustomerEmail(),
                StatusResponse.from(ticket.getStatus()),
                ticket.getPriority(),
                ticket.getDeadline(),
                ticket.getAssignee() == null ? null : AssigneeResponse.from(ticket.getAssignee()),
                tags,
                ticket.getCreatedAt());
    }
}
