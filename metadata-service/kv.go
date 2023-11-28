package main

import (
	"context"
)

type Key []byte
type Value []byte

type KeyValueStore interface {
	Get(ctx context.Context, key Key) (Value, error)
	Put(ctx context.Context, key Key, value Value) error
	Delete(ctx context.Context, key Key) error
}
