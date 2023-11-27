package main

import "fmt"

type SystemStatusHeartbeat struct {
	TotalRam       string `json:"totalRam"`
	FreeRam        string `json:"freeRam"`
	DatabaseSize   string `json:"databaseSize"`
	FreeSpace      string `json:"freeSpace"`
	TotalSpace     string `json:"totalSpace"`
	AvailableSpace string `json:"availableSpace"`
}

func (s *SystemStatusHeartbeat) String() string {
	return fmt.Sprintf("TotalRam: %s, FreeRam: %s, DatabaseSize: %s, FreeSpace: %s, TotalSpace: %s, availableSpace: %s",
		s.TotalRam, s.FreeRam, s.DatabaseSize, s.FreeSpace, s.TotalSpace, s.AvailableSpace)
}
