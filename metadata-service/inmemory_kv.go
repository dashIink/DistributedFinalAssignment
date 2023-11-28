package main

import (
	"context"
	"sync"
)

type inMemoryKeyValueStore struct {
	mut sync.RWMutex
	m   map[string]Value
}

func NewInMemoryKeyValueStore() KeyValueStore {
	return &inMemoryKeyValueStore{
		m: make(map[string]Value),
	}
}

type ErrKeyNotFound struct{}

func (e ErrKeyNotFound) Error() string {
	return "key not found"
}

type ErrNoKeyProvided struct{}

func (e ErrNoKeyProvided) Error() string {
	return "no key provided (key is empty)"
}

func (s *inMemoryKeyValueStore) Get(ctx context.Context, key Key) (Value, error) {
	s.mut.RLock()
	defer s.mut.RUnlock()
	if value, ok := s.m[string(key)]; ok {
		return value, nil
	}
	return nil, ErrKeyNotFound{}
}

func (s *inMemoryKeyValueStore) Put(ctx context.Context, key Key, value Value) error {
	s.mut.Lock()
	defer s.mut.Unlock()
	if len(key) == 0 || key == nil {
		return ErrNoKeyProvided{}
	}
	s.m[string(key)] = value
	return nil
}

func (s *inMemoryKeyValueStore) Delete(ctx context.Context, key Key) error {
	s.mut.Lock()
	defer s.mut.Unlock()
	if _, ok := s.m[string(key)]; ok {
		delete(s.m, string(key))
		return nil
	}
	return ErrKeyNotFound{}
}
