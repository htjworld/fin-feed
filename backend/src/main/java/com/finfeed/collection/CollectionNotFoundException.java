package com.finfeed.collection;

public class CollectionNotFoundException extends RuntimeException {

    public CollectionNotFoundException(Long id) {
        super("Collection not found: " + id);
    }
}
