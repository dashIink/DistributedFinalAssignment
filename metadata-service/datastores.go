package main

import (
	"container/heap"
	"fmt"
	"math"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Datastore struct {
	Hostname string
	Port     int

	SystemStatus SystemStatusHeartbeat
}

func (d *Datastore) String() string {
	return fmt.Sprintf("%s:%d", d.Hostname, d.Port)
}

const DEFAULT_TTL = time.Duration(10000) * time.Millisecond
const DEFAULT_MAX_MISSED = 3

type TTLDatastore struct {
	Datastore
	LastHeartbeat time.Time
	MissedCount   uint64
	MaxMissed     uint64        // Max number of missed heartbeats before removing the datastore from the heap.
	TTL           time.Duration // TTL in Milliseconds
	Index         int           // Index of the item in the heap, needed for heap.Interface implementation.
}

const (
	weightFreeSpace    = 3
	weightFreeRam      = 2
	weightDatabaseSize = 1
	weightMissedCount  = 5
)

func (d *TTLDatastore) Score() uint64 {

	// Convert to bytes for comparison
	freeSpace, _ := parseBytes(d.SystemStatus.FreeSpace)
	freeRam, _ := parseBytes(d.SystemStatus.FreeRam)
	databaseSize, _ := parseBytes(d.SystemStatus.DatabaseSize)

	score := ((freeRam * weightFreeRam) + (freeSpace * weightFreeSpace) - (databaseSize * weightDatabaseSize)) - (d.MissedCount * weightMissedCount)

	return score
}

// UpdateHeartbeat updates the LastHeartbeat to the current time and resets MissedCount.
func (d *TTLDatastore) UpdateHeartbeat() {
	d.LastHeartbeat = time.Now()
	d.MissedCount = 0
}

// CheckTTL evaluates whether a datastore is still within the healthy threshold of missed heartbeats.
// It increments the MissedCount if the time elapsed since the last heartbeat exceeds the TTL.
// If the MissedCount is less than or equal to the MaxMissed value, the datastore is considered healthy.
// Once the MissedCount exceeds MaxMissed, the datastore is considered unhealthy.
//
// Returns:
//   - true if the datastore has not surpassed the MaxMissed threshold.
//   - false if the datastore has exceeded the MaxMissed threshold, indicating it is unhealthy.
func (d *TTLDatastore) CheckTTL() bool {
	elapsed := time.Since(d.LastHeartbeat)
	ttl := d.TTL
	if elapsed > ttl {
		d.MissedCount++
	} else {
		d.MissedCount = 0
	}
	return d.MissedCount <= d.MaxMissed
}

type DatastoreHeap struct {
	mut          sync.RWMutex
	internalData []*TTLDatastore
	internalMap  map[string]*TTLDatastore
}

func (h *DatastoreHeap) IsInternalMapInitialized() bool {
	return h.internalMap != nil
}

func (h *DatastoreHeap) IsInternalDataInitialized() bool {
	return h.internalData != nil
}

func NewDatastoreHeap() *DatastoreHeap {
	dsHeap := &DatastoreHeap{
		internalData: make([]*TTLDatastore, 0),
		internalMap:  make(map[string]*TTLDatastore, 0),
	}
	heap.Init(dsHeap)
	return dsHeap
}

func parseBytes(s string) (uint64, error) {

	units := map[string]uint64{
		"Bytes": 1,
		"KB":    1 << 10,                   // 1024
		"MB":    1 << 20,                   // 1024^2
		"GB":    1 << 30,                   // 1024^3
		"TB":    1 << 40,                   // 1024^4
		"PB":    1 << 50,                   // 1024^5
		"EB":    1 << 60,                   // 1024^6
		"ZB":    uint64(math.Pow(1024, 7)), // 1024^7
		"YB":    uint64(math.Pow(1024, 8)), // 1024^8
	}

	// Trim the input string to handle leading/trailing whitespaces.
	s = strings.TrimSpace(s)

	// Split the string into numeric and unit parts.
	parts := strings.Fields(s)
	if len(parts) != 2 {
		return 0, fmt.Errorf("invalid format: %s", s)
	}

	// Parse the numeric part.
	value, err := strconv.ParseFloat(parts[0], 64)
	if err != nil {
		return 0, fmt.Errorf("invalid number: %s", parts[0])
	}

	// Find the multiplier for the unit.
	multiplier, exists := units[parts[1]]
	if !exists {
		return 0, fmt.Errorf("unknown unit: %s", parts[1])
	}

	// Calculate the number of bytes.
	bytes := uint64(value * float64(multiplier))

	return bytes, nil
}

func (h *DatastoreHeap) Len() int {
	return len(h.internalData)
}

func (h *DatastoreHeap) Less(i, j int) bool {

	scoreI := h.internalData[i].Score()
	scoreJ := h.internalData[j].Score()

	// A datastore with a higher score is preferred
	return scoreI > scoreJ
}

func (h *DatastoreHeap) Swap(i, j int) {
	h.internalData[i], h.internalData[j] = h.internalData[j], h.internalData[i]
	h.internalData[i].Index = i
	h.internalData[j].Index = j

	// Update the map
	h.internalMap[h.internalData[i].Datastore.String()] = h.internalData[i]
	h.internalMap[h.internalData[j].Datastore.String()] = h.internalData[j]
}

func (h *DatastoreHeap) Push(x interface{}) {
	n := len(h.internalData)
	item := x.(*TTLDatastore)
	item.Index = n
	item.UpdateHeartbeat()
	h.internalData = append(h.internalData, item)

	hostname := x.(*TTLDatastore).Hostname
	port := x.(*TTLDatastore).Port
	// Update the map
	h.internalMap[hostname+":"+strconv.Itoa(port)] = item
}

func (h *DatastoreHeap) Pop() interface{} {

	old := h.internalData
	n := len(old)
	x := old[n-1]
	h.internalData = old[0 : n-1]
	x.Index = -1 // for safety

	hostname := x.Hostname
	port := x.Port
	// Update the map
	delete(h.internalMap, hostname+":"+strconv.Itoa(port))
	return x
}

// RemoveDead removes any Datastore that has exceeded its TTL.
func (h *DatastoreHeap) RemoveDead() {
	h.mut.Lock()
	defer h.mut.Unlock()

	for i := 0; i < len(h.internalData); {
		fmt.Printf("Checking %s\n", h.internalData[i].Datastore.String())
		if !(h.internalData)[i].CheckTTL() {
			// Remove the Datastore from the map.
			hostname := h.internalData[i].Hostname
			port := h.internalData[i].Port
			delete(h.internalMap, hostname+":"+strconv.Itoa(port))

			// Remove the Datastore from the heap.
			heap.Remove(h, i)
		} else {
			// Since the CheckTTL method increments the MissedCount if the TTL is exceeded,
			// we need to heap.Fix to re-establish the heap ordering.
			heap.Fix(h, i)
			i++
		}
	}
}

// PeriodicCheck is a function that could be run in a separate goroutine to check TTL for all datastores.
func PeriodicCheck(h *DatastoreHeap, interval time.Duration) {
	for {
		time.Sleep(interval)
		h.RemoveDead()
	}
}

// TopK returns the top k elements from the heap without altering the heap.
func (h *DatastoreHeap) TopK(k uint64) []TTLDatastore {
	h.mut.RLock()
	defer h.mut.RUnlock()

	var topK []TTLDatastore
	tempHeap := make([]*TTLDatastore, h.Len())
	copy(tempHeap, h.internalData) // Make a copy to not disturb the original heap

	temp := NewDatastoreHeap()
	temp.internalData = tempHeap
	heap.Init(temp)
	for i := 0; i < int(k); i++ {
		if temp.Len() > 0 {
			// Pop the top element from the heap
			top := heap.Pop(temp).(*TTLDatastore)
			topK = append(topK, *top)
		} else {
			break
		}
	}
	return topK
}

// AddOrUpdateDatastore updates an existing datastore or adds a new one to the heap.
func (dh *DatastoreHeap) AddOrUpdateDatastore(newDs Datastore) *TTLDatastore {
	dh.mut.Lock()
	defer dh.mut.Unlock()

	identifier := newDs.Hostname + ":" + strconv.Itoa(newDs.Port)
	if existingDS, ok := dh.internalMap[identifier]; ok {
		// Update existing datastore info (except TTL related fields)
		existingDS.Datastore = newDs
		existingDS.LastHeartbeat = time.Now() // Update the LastHeartbeat to current time
		// heap.Fix re-establishes the heap ordering after the update.
		heap.Fix(dh, existingDS.Index)
		return existingDS
	} else {
		// Create a new TTLDatastore with default values for TTL related fields.
		ttlDs := &TTLDatastore{
			Datastore:     newDs,
			LastHeartbeat: time.Now(),  // Initialize LastHeartbeat to the current time
			TTL:           DEFAULT_TTL, // Set a default TTL value
			MaxMissed:     DEFAULT_MAX_MISSED,
			MissedCount:   0,
			// MissedCount will be initialized to 0 by default
		}
		heap.Push(dh, ttlDs)
		// The map is updated in the Push method so no need to update it here.
		return ttlDs
	}
}

// RemoveDatastore removes a datastore from the heap.
func (dh *DatastoreHeap) RemoveDatastore(hostnamePort string) {
	dh.mut.Lock()
	defer dh.mut.Unlock()

	if ds, ok := dh.internalMap[hostnamePort]; ok {
		heap.Remove(dh, ds.Index)
	}
}
