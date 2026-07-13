package com.aurexillion.tickets.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record StatusRequest(
        @NotBlank(message = "must not be blank") String name,
        @NotBlank(message = "must not be blank")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "must be a hex color #RRGGBB")
        String color,
        @NotNull(message = "must not be null") Integer position,
        boolean isInitial,
        Boolean active
) {
}
