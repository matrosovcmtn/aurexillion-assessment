package com.aurexillion.tickets.service;

import com.aurexillion.tickets.dto.TagRequest;
import com.aurexillion.tickets.error.BadRequestException;
import com.aurexillion.tickets.error.NotFoundException;
import com.aurexillion.tickets.model.Tag;
import com.aurexillion.tickets.repository.TagRepository;
import com.aurexillion.tickets.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public List<Tag> list() {
        return tagRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public Tag get(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tag " + id + " not found"));
    }

    @Transactional
    public Tag create(TagRequest request) {
        String name = request.name().trim();
        if (tagRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Tag name already exists");
        }
        return tagRepository.save(new Tag(name));
    }

    @Transactional
    public Tag update(Long id, TagRequest request) {
        Tag tag = get(id);
        String name = request.name().trim();
        if (tagRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new BadRequestException("Tag name already exists");
        }
        tag.setName(name);
        return tagRepository.save(tag);
    }

    @Transactional
    public void delete(Long id) {
        Tag tag = get(id);
        ticketRepository.unlinkTag(id);
        tagRepository.delete(tag);
    }

    @Transactional(readOnly = true)
    public Set<Tag> requireAll(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Set.of();
        }
        List<Tag> tags = tagRepository.findByIdIn(ids);
        if (tags.size() != ids.stream().distinct().count()) {
            throw new BadRequestException("One or more tags were not found");
        }
        return new HashSet<>(tags);
    }
}
