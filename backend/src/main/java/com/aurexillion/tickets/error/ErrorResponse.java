package com.aurexillion.tickets.error;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(String error, List<FieldErrorDetail> details) {

    public static ErrorResponse of(String error) {
        return new ErrorResponse(error, null);
    }

    public static ErrorResponse of(String error, List<FieldErrorDetail> details) {
        return new ErrorResponse(error, details);
    }
}
