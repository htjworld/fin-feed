package com.finfeed.collection;

import com.finfeed.collection.dto.CollectionDetailResponse;
import com.finfeed.collection.dto.CollectionSummaryResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public ResponseEntity<List<CollectionSummaryResponse>> getCollections() {
        return ResponseEntity.ok(collectionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollectionDetailResponse> getCollection(@PathVariable Long id) {
        return ResponseEntity.ok(collectionService.findById(id));
    }
}
