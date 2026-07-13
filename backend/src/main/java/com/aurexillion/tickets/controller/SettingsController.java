package com.aurexillion.tickets.controller;

import com.aurexillion.tickets.dto.SettingsRequest;
import com.aurexillion.tickets.dto.SettingsResponse;
import com.aurexillion.tickets.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public SettingsResponse get() {
        return SettingsResponse.from(settingsService.getOrCreate());
    }

    @PutMapping
    public SettingsResponse update(@Valid @RequestBody SettingsRequest request) {
        return SettingsResponse.from(settingsService.update(request));
    }
}
