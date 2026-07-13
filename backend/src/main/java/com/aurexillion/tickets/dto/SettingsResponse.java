package com.aurexillion.tickets.dto;

import com.aurexillion.tickets.model.AppSettings;

public record SettingsResponse(String ticketCodePrefix) {
    public static SettingsResponse from(AppSettings settings) {
        return new SettingsResponse(settings.getTicketCodePrefix());
    }
}
