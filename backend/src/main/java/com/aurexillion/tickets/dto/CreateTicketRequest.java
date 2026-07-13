package com.aurexillion.tickets.dto;

import com.aurexillion.tickets.model.Priority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public record CreateTicketRequest(
        @NotBlank(message = "must not be blank") String title,
        @NotBlank(message = "must not be blank") String description,
        @NotBlank(message = "must not be blank") String customerName,
        @NotBlank(message = "must not be blank") @Email(message = "must be a valid email") String customerEmail,
        @NotNull(message = "must not be null") Priority priority,
        Instant deadline,
        Long assigneeId,
        List<Long> tagIds
) {
}
