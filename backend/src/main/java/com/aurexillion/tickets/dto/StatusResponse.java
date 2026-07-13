package com.aurexillion.tickets.dto;

import com.aurexillion.tickets.model.TicketStatus;

public record StatusResponse(
        Long id,
        String name,
        String color,
        int position,
        boolean isInitial,
        boolean active
) {
    public static StatusResponse from(TicketStatus status) {
        return new StatusResponse(
                status.getId(),
                status.getName(),
                status.getColor(),
                status.getPosition(),
                status.isInitial(),
                status.isActive());
    }
}
