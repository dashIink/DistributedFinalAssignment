package main

import (
	"context"
	"encoding/json"
	gen "metadata-service/.pb"
	"sync"
	"testing"

	"google.golang.org/protobuf/proto"
)

func IsValuesEqual(a, b Value) bool {
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func TestPutAndGet(t *testing.T) {
	store := NewInMemoryKeyValueStore()
	ctx := context.Background()

	key := Key("testkey")
	expectedValue := Value("testvalue")

	err := store.Put(ctx, key, expectedValue)
	if err != nil {
		t.Fatalf("Put failed: %s", err)
	}

	value, err := store.Get(ctx, key)
	if err != nil {
		t.Fatalf("Get failed: %s", err)
	}

	if !IsValuesEqual(value, expectedValue) {
		t.Errorf("Expected value %s, got %s", expectedValue, value)
	}
}

func TestGetNonExistentKey(t *testing.T) {
	store := NewInMemoryKeyValueStore()
	ctx := context.Background()

	_, err := store.Get(ctx, Key("nonexistent"))
	if err == nil {
		t.Errorf("Expected an error for non-existent key, got none")
	}
}

func TestConcurrentAccess(t *testing.T) {
	store := NewInMemoryKeyValueStore()
	ctx := context.Background()
	var wg sync.WaitGroup

	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			key := Key("key" + string(rune(i)))
			store.Put(ctx, key, Value("value"))
		}(i)
	}

	wg.Wait()

	for i := 0; i < 100; i++ {
		_, err := store.Get(ctx, Key("key"+string(rune(i))))
		if err != nil {
			t.Errorf("Failed to get key: key%d", i)
		}
	}
}

func TestDeleteKey(t *testing.T) {
	store := NewInMemoryKeyValueStore()
	ctx := context.Background()

	key := Key("deletetest")
	store.Put(ctx, key, Value("value"))

	err := store.Delete(ctx, key)
	if err != nil {
		t.Fatalf("Delete failed: %s", err)
	}

	_, err = store.Get(ctx, key)
	if err == nil {
		t.Errorf("Expected an error for deleted key, got none")
	}
}

func TestUpdateKey(t *testing.T) {
	store := NewInMemoryKeyValueStore()
	ctx := context.Background()

	key := Key("updatetest")
	initialValue := Value("initial")
	updatedValue := Value("updated")

	store.Put(ctx, key, initialValue)
	store.Put(ctx, key, updatedValue)

	value, _ := store.Get(ctx, key)
	if !IsValuesEqual(value, updatedValue) {
		t.Errorf("Expected value %s, got %s", updatedValue, value)
	}
}

func TestGetNonExistentKeyAfterDelete(t *testing.T) {
	store := NewInMemoryKeyValueStore()
	ctx := context.Background()

	key := Key("deletetest")
	store.Put(ctx, key, Value("value"))

	store.Delete(ctx, key)

	_, err := store.Get(ctx, key)
	if err == nil {
		t.Errorf("Expected an error for deleted key, got none")
	}
}

func TestDeleteNonExistentKey(t *testing.T) {
	store := NewInMemoryKeyValueStore()
	ctx := context.Background()

	err := store.Delete(ctx, Key("nonexistent"))
	if err == nil {
		t.Errorf("Expected an error for non-existent key, got none")
	}
}

func TestPutEmptyKey(t *testing.T) {
	store := NewInMemoryKeyValueStore()
	ctx := context.Background()

	err := store.Put(ctx, Key(""), Value("value"))
	if err == nil {
		t.Errorf("Expected an error for empty key, got none")
	}
}

func TestJsonAsValue(t *testing.T) {
	type TestNestedStruct struct {
		Field1 string `json:"field1"`
		Field2 int    `json:"field2"`
		Field3 bool   `json:"field3"`
	}
	type TestStruct struct {
		Field1 string           `json:"field1"`
		Field2 int              `json:"field2"`
		Field3 bool             `json:"field3"`
		Field4 float64          `json:"field4"`
		Field5 []string         `json:"field5"`
		Field6 TestNestedStruct `json:"field6"`
	}

	store := NewInMemoryKeyValueStore()
	ctx := context.Background()

	key := Key("testkey")
	expectedValue := TestStruct{
		Field1: "testvalue",
		Field2: 123,
		Field3: true,
		Field4: 1.23,
		Field5: []string{"a", "b", "c"},
		Field6: TestNestedStruct{
			Field1: "nested",
			Field2: 456,
			Field3: false,
		},
	}

	jnEncoded, err := json.Marshal(expectedValue)
	if err != nil {
		t.Fatalf("Failed to marshal JSON: %s", err)
	}

	err = store.Put(ctx, key, jnEncoded)

	value, err := store.Get(ctx, key)

	var actualValue TestStruct
	err = json.Unmarshal(value, &actualValue)
	if err != nil {
		t.Fatalf("Failed to unmarshal JSON: %s", err)
	}

	if actualValue.Field1 != expectedValue.Field1 {
		t.Errorf("Expected value %s, got %s", expectedValue.Field1, actualValue.Field1)
	}

	if actualValue.Field2 != expectedValue.Field2 {
		t.Errorf("Expected value %d, got %d", expectedValue.Field2, actualValue.Field2)
	}

	if actualValue.Field3 != expectedValue.Field3 {
		t.Errorf("Expected value %t, got %t", expectedValue.Field3, actualValue.Field3)
	}

	if actualValue.Field4 != expectedValue.Field4 {
		t.Errorf("Expected value %f, got %f", expectedValue.Field4, actualValue.Field4)
	}

	if len(actualValue.Field5) != len(expectedValue.Field5) {
		t.Errorf("Expected value %d, got %d", len(expectedValue.Field5), len(actualValue.Field5))
	}

	if actualValue.Field5[0] != expectedValue.Field5[0] {
		t.Errorf("Expected value %s, got %s", expectedValue.Field5[0], actualValue.Field5[0])
	}

	if actualValue.Field5[1] != expectedValue.Field5[1] {
		t.Errorf("Expected value %s, got %s", expectedValue.Field5[1], actualValue.Field5[1])
	}

	if actualValue.Field5[2] != expectedValue.Field5[2] {
		t.Errorf("Expected value %s, got %s", expectedValue.Field5[2], actualValue.Field5[2])
	}

	if actualValue.Field6.Field1 != expectedValue.Field6.Field1 {
		t.Errorf("Expected value %s, got %s", expectedValue.Field6.Field1, actualValue.Field6.Field1)
	}

	if actualValue.Field6.Field2 != expectedValue.Field6.Field2 {
		t.Errorf("Expected value %d, got %d", expectedValue.Field6.Field2, actualValue.Field6.Field2)
	}

	if actualValue.Field6.Field3 != expectedValue.Field6.Field3 {
		t.Errorf("Expected value %t, got %t", expectedValue.Field6.Field3, actualValue.Field6.Field3)
	}
}

func TestProtoBufAsValue(t *testing.T) {
	store := NewInMemoryKeyValueStore()
	ctx := context.Background()

	key := Key("testkey")
	expectedValue := &gen.RegisterFileChunkRequest{
		Sequence:    3,
		DatastoreId: "datastore1",
		FileId:      "file1",
		ChunkSize:   1024,
		ChunkHash:   "chunkhash",
		Timestamp:   1234567890,
	}

	pbEncoded, err := proto.Marshal(expectedValue)
	if err != nil {
		t.Fatalf("Failed to marshal proto: %s", err)
	}

	err = store.Put(ctx, key, pbEncoded)
	if err != nil {
		t.Fatalf("Put failed: %s", err)
	}

	value, err := store.Get(ctx, key)
	if err != nil {
		t.Fatalf("Get failed: %s", err)
	}

	var actualValue gen.RegisterFileChunkRequest
	err = proto.Unmarshal(value, &actualValue)
	if err != nil {
		t.Fatalf("Failed to unmarshal proto: %s", err)
	}

	if actualValue.Sequence != expectedValue.Sequence {
		t.Errorf("Expected value %d, got %d", expectedValue.Sequence, actualValue.Sequence)
	}

	if actualValue.DatastoreId != expectedValue.DatastoreId {
		t.Errorf("Expected value %s, got %s", expectedValue.DatastoreId, actualValue.DatastoreId)
	}

	if actualValue.FileId != expectedValue.FileId {
		t.Errorf("Expected value %s, got %s", expectedValue.FileId, actualValue.FileId)
	}

	if actualValue.ChunkSize != expectedValue.ChunkSize {
		t.Errorf("Expected value %d, got %d", expectedValue.ChunkSize, actualValue.ChunkSize)
	}

	if actualValue.ChunkHash != expectedValue.ChunkHash {
		t.Errorf("Expected value %s, got %s", expectedValue.ChunkHash, actualValue.ChunkHash)
	}

	if actualValue.Timestamp != expectedValue.Timestamp {
		t.Errorf("Expected value %d, got %d", expectedValue.Timestamp, actualValue.Timestamp)
	}
}
