package main

import (
	"container/heap"
	"os"
	"testing"
	"time"
)

// helper function to create a new datastore with system status.
func newDatastore(hostname string, port int, freeSpace, freeRam, databaseSize string) Datastore {
	return Datastore{
		Hostname: hostname,
		Port:     port,
		SystemStatus: SystemStatusHeartbeat{
			FreeSpace:    freeSpace,
			FreeRam:      freeRam,
			DatabaseSize: databaseSize,
		},
	}
}

// TestNewDatastoreHeap tests the initialization of a new DatastoreHeap.
func TestNewDatastoreHeap(t *testing.T) {
	dsHeap := NewDatastoreHeap()
	if dsHeap == nil {
		t.Errorf("NewDatastoreHeap() returned nil")
	}

	if dsHeap.Len() != 0 {
		t.Errorf("NewDatastoreHeap() should create an empty heap, got %d", dsHeap.Len())
	}

	if !dsHeap.IsInternalDataInitialized() {
		t.Errorf("NewDatastoreHeap() should initialize the internal data slice")
	}

	if !dsHeap.IsInternalMapInitialized() {
		t.Errorf("NewDatastoreHeap() should initialize the internal map")
	}
}

// TestAddOrUpdateDatastore tests adding new datastores and updating existing ones.
func TestAddOrUpdateDatastore(t *testing.T) {
	dsHeap := NewDatastoreHeap()

	// Add a new datastore.
	ds1 := newDatastore("datastore1", 8080, "1GB", "2GB", "10MB")
	dsHeap.AddOrUpdateDatastore(ds1)

	if dsHeap.Len() != 1 {
		t.Errorf("Expected heap size to be 1, got %d", dsHeap.Len())
	}

	// Update the same datastore.
	ds1Updated := newDatastore("datastore1", 8080, "2GB", "3GB", "15MB")
	dsHeap.AddOrUpdateDatastore(ds1Updated)

	if dsHeap.Len() != 1 {
		t.Errorf("Expected heap size to be 1 after update, got %d", dsHeap.Len())
	}

	// Ensure the update took effect.
	topDS := dsHeap.TopK(1)
	if len(topDS) != 1 || topDS[0].SystemStatus.FreeSpace != "2GB" {
		t.Errorf("Datastore update did not take effect in heap")
	}
}

// TestRemoveDead tests the removal of dead datastores based on TTL.
func TestRemoveDead(t *testing.T) {
	dsHeap := NewDatastoreHeap()

	// Add a new datastore with default TTL.
	ds1 := newDatastore("datastore1", 8080, "1GB", "2GB", "10MB")
	ttlDs1 := dsHeap.AddOrUpdateDatastore(ds1)

	t.Logf("DEFAULT_MAX_MISSED is %d", DEFAULT_MAX_MISSED)
	t.Logf("DEFAULT_TTL is %s", DEFAULT_TTL.String())

	t.Logf("In order for datastore to be removed, it must miss %d heartbeats", DEFAULT_MAX_MISSED)
	// Simulate time passing and check TTL.
	for i := 1; i <= DEFAULT_MAX_MISSED; i++ {
		t.Logf("Missed %d heartbeats before checking TTL", ttlDs1.MissedCount)
		t.Logf("Sleeping for %s more than DEFAULT_TTL %s",
			(time.Duration(1000) * time.Millisecond).String(),
			DEFAULT_TTL.String())
		time.Sleep(DEFAULT_TTL + (time.Duration(1000) * time.Millisecond))
		dsHeap.RemoveDead()
		t.Logf("Missed %d heartbeats after checking TTL", ttlDs1.MissedCount)
		if dsHeap.Len() != 1 {
			t.Errorf("Expected heap size to be 1 after %d heartbeats, got %d", i, dsHeap.Len())
		}
	}

	t.Logf("Datastore missed %d heartbeats so far and max is %d", ttlDs1.MissedCount, ttlDs1.MaxMissed)
	t.Logf("So datastore should be removed now")
	dsHeap.RemoveDead()
	if dsHeap.Len() != 0 {
		t.Errorf("Expected heap size to be 0 after removing dead datastores, got %d", dsHeap.Len())
	}
}

// TestTopK tests the retrieval of top k datastores.
func TestTopK(t *testing.T) {
	dsHeap := NewDatastoreHeap()

	// Add multiple datastores.
	ds1 := newDatastore("datastore1", 8080, "1 GB", "2 GB", "10 MB")
	ds2 := newDatastore("datastore2", 8081, "1.5 GB", "1 GB", "20 MB")
	ds3 := newDatastore("datastore3", 8082, "500 MB", "3 GB", "30 MB")
	ds4 := newDatastore("datastore4", 8083, "500 MB", "4 GB", "40 MB")

	ttlds1 := dsHeap.AddOrUpdateDatastore(ds1)
	ttlds2 := dsHeap.AddOrUpdateDatastore(ds2)
	ttlds3 := dsHeap.AddOrUpdateDatastore(ds3)
	ttlds4 := dsHeap.AddOrUpdateDatastore(ds4)

	// Introduce missed heartbeats.
	ttlds1.MissedCount = 3
	ttlds2.MissedCount = 1
	ttlds3.MissedCount = 2
	ttlds4.MissedCount = 0

	// Re-sort the heap after changing MissedCount.
	for i := range dsHeap.internalData {
		heap.Fix(dsHeap, i)
	}

	// Log the current state of the heap.
	for i, ds := range dsHeap.internalData {
		t.Logf("Heap item %d is %s with score %d", i, ds.Hostname, ds.Score())
	}

	// Retrieve the top 2 datastores.
	topDS := dsHeap.TopK(2)
	if len(topDS) != 2 {
		t.Fatalf("Expected TopK to return 2 datastores, got %d", len(topDS))
	}

	// Check if the top 2 datastores are as expected.
	if topDS[0].Hostname != "datastore4" || topDS[1].Hostname != "datastore3" {
		t.Errorf("TopK didn't return the expected datastores, got %v", topDS)
	}
}

// TestHeapOperations tests the basic operations of the heap to ensure they maintain the heap property.
func TestHeapOperations(t *testing.T) {
	dsHeap := NewDatastoreHeap()

	// Add multiple datastores.
	ds1 := newDatastore("datastore1", 8080, "1 GB", "2 GB", "10 MB")
	ds2 := newDatastore("datastore2", 8081, "1.5 GB", "1 GB", "90 MB")
	ds3 := newDatastore("datastore3", 8082, "500 MB", "3 GB", "20 MB")
	ds4 := newDatastore("datastore4", 8083, "1 GB", "4 GB", "50 MB")

	ttlds1 := &TTLDatastore{Datastore: ds1, LastHeartbeat: time.Now(), MissedCount: 2, TTL: DEFAULT_TTL, MaxMissed: DEFAULT_MAX_MISSED}
	ttlds2 := &TTLDatastore{Datastore: ds2, LastHeartbeat: time.Now(), MissedCount: 1, TTL: DEFAULT_TTL, MaxMissed: DEFAULT_MAX_MISSED}
	ttlds3 := &TTLDatastore{Datastore: ds3, LastHeartbeat: time.Now(), MissedCount: 3, TTL: DEFAULT_TTL, MaxMissed: DEFAULT_MAX_MISSED}
	ttlds4 := &TTLDatastore{Datastore: ds4, LastHeartbeat: time.Now(), MissedCount: 1, TTL: DEFAULT_TTL, MaxMissed: DEFAULT_MAX_MISSED}

	heap.Push(dsHeap, ttlds1)
	heap.Push(dsHeap, ttlds2)
	heap.Push(dsHeap, ttlds3)
	heap.Push(dsHeap, ttlds4)

	if dsHeap.Len() != 4 {
		t.Fatalf("Expected heap size to be 3 after adding datastores, got %d", dsHeap.Len())
	}

	// Pop an item and check that the heap property is maintained.
	popped := heap.Pop(dsHeap).(*TTLDatastore)
	if popped.Hostname != "datastore4" {
		t.Errorf("Pop didn't return the expected datastore with the highest score")
	}

	if dsHeap.Len() != 3 {
		t.Errorf("Expected heap size to be 3 after popping one datastore, got %d", dsHeap.Len())
	}

	popped = heap.Pop(dsHeap).(*TTLDatastore)
	if popped.Hostname != "datastore3" {
		t.Errorf("Pop didn't return the expected datastore with the highest score")
	}

	if dsHeap.Len() != 2 {
		t.Errorf("Expected heap size to be 2 after popping one datastore, got %d", dsHeap.Len())
	}

	popped = heap.Pop(dsHeap).(*TTLDatastore)
	if popped.Hostname != "datastore1" {
		t.Errorf("Pop didn't return the expected datastore with the highest score")
	}

	if dsHeap.Len() != 1 {
		t.Errorf("Expected heap size to be 1 after popping one datastore, got %d", dsHeap.Len())
	}

	popped = heap.Pop(dsHeap).(*TTLDatastore)
	if popped.Hostname != "datastore2" {
		t.Errorf("Pop didn't return the expected datastore with the highest score")
	}

	if dsHeap.Len() != 0 {
		t.Errorf("Expected heap size to be 0 after popping one datastore, got %d", dsHeap.Len())
	}

}

// more tests...

// Main function to run the tests.
func TestMain(m *testing.M) {
	// Call flag.Parse() here if TestMain uses flags.
	exitVal := m.Run()

	// Your teardown logic here.

	os.Exit(exitVal)
}
