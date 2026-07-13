package com.aurexillion.tickets.service;

import com.aurexillion.tickets.dto.SettingsRequest;
import com.aurexillion.tickets.model.AppSettings;
import com.aurexillion.tickets.repository.AppSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final AppSettingsRepository appSettingsRepository;

    @Transactional
    public AppSettings getOrCreate() {
        return appSettingsRepository.findById(1L).orElseGet(() -> {
            AppSettings settings = new AppSettings();
            return appSettingsRepository.save(settings);
        });
    }

    @Transactional
    public AppSettings update(SettingsRequest request) {
        AppSettings settings = getOrCreate();
        settings.setTicketCodePrefix(request.ticketCodePrefix().trim().toLowerCase());
        return appSettingsRepository.save(settings);
    }

    @Transactional
    public String nextTicketCode() {
        AppSettings settings = getOrCreate();
        long number = settings.getNextTicketNumber();
        settings.setNextTicketNumber(number + 1);
        appSettingsRepository.save(settings);
        return settings.getTicketCodePrefix() + "-" + number;
    }
}
