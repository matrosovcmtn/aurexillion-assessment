package com.aurexillion.tickets.dto;

import jakarta.validation.constraints.NotBlank;

public record TagRequest(
        @NotBlank(message = "must not be blank") String name
) {
}
