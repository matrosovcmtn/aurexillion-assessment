package com.aurexillion.tickets.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AssigneeRequest(
        @NotBlank(message = "must not be blank") String name,
        @NotBlank(message = "must not be blank") @Email(message = "must be a valid email") String email,
        @NotBlank(message = "must not be blank") String department,
        String position
) {
}
