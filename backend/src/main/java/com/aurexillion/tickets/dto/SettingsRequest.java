package com.aurexillion.tickets.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SettingsRequest(
        @NotBlank(message = "must not be blank")
        @Size(max = 16, message = "must be at most 16 characters")
        @Pattern(regexp = "^[a-z0-9]+$", message = "must be lowercase alphanumeric")
        String ticketCodePrefix
) {
}
