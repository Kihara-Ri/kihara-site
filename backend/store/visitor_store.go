package store

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"kihara.cn/personal-site/model"
)

type visitorRecord struct {
	VisitorID      string    `json:"visitor_id"`
	Fingerprint    string    `json:"fingerprint"`
	VisitorOrdinal int       `json:"visitor_ordinal"`
	VisitCount     int       `json:"visit_count"`
	FirstSeenAt    time.Time `json:"first_seen_at"`
	LastSeenAt     time.Time `json:"last_seen_at"`
	LastIP         string    `json:"last_ip"`
	LastUserAgent  string    `json:"last_user_agent"`
	LastLanguage   string    `json:"last_language"`
}

type visitorStoreState struct {
	Records []*visitorRecord `json:"records"`
}

type VisitorStore struct {
	mu      sync.Mutex
	path    string
	records []*visitorRecord
}

func NewVisitorStore(path string) (*VisitorStore, error) {
	store := &VisitorStore{path: path, records: []*visitorRecord{}}
	if err := store.load(); err != nil {
		return nil, err
	}
	return store, nil
}

func (s *VisitorStore) Register(visitorID, ip, userAgent, acceptLanguage string) (model.VisitInfo, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UTC()
	fingerprint := buildFingerprint(ip, userAgent, acceptLanguage)

	record := s.findRecord(visitorID, fingerprint)
	isFirstVisit := false

	if record == nil {
		isFirstVisit = true
		record = &visitorRecord{
			VisitorID:      visitorID,
			Fingerprint:    fingerprint,
			VisitorOrdinal: len(s.records) + 1,
			VisitCount:     0,
			FirstSeenAt:    now,
		}
		s.records = append(s.records, record)
	}

	if record.VisitorID == "" && visitorID != "" {
		record.VisitorID = visitorID
	}

	record.VisitCount++
	record.LastSeenAt = now
	record.LastIP = ip
	record.LastUserAgent = userAgent
	record.LastLanguage = acceptLanguage

	if err := s.save(); err != nil {
		return model.VisitInfo{}, err
	}

	return model.VisitInfo{
		VisitorID:      record.VisitorID,
		VisitorOrdinal: record.VisitorOrdinal,
		VisitCount:     record.VisitCount,
		IsFirstVisit:   isFirstVisit,
	}, nil
}

func (s *VisitorStore) findRecord(visitorID, fingerprint string) *visitorRecord {
	if visitorID != "" {
		for _, record := range s.records {
			if record.VisitorID == visitorID {
				return record
			}
		}
	}

	for _, record := range s.records {
		if record.Fingerprint == fingerprint {
			return record
		}
	}

	return nil
}

func (s *VisitorStore) load() error {
	data, err := os.ReadFile(s.path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	var state visitorStoreState
	if err := json.Unmarshal(data, &state); err != nil {
		return err
	}

	s.records = state.Records
	if s.records == nil {
		s.records = []*visitorRecord{}
	}

	return nil
}

func (s *VisitorStore) save() error {
	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(visitorStoreState{Records: s.records}, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.path, data, 0o644)
}

func buildFingerprint(ip, userAgent, acceptLanguage string) string {
	payload := strings.Join([]string{
		strings.TrimSpace(ip),
		strings.TrimSpace(userAgent),
		strings.TrimSpace(acceptLanguage),
	}, "|")
	sum := sha256.Sum256([]byte(payload))
	return hex.EncodeToString(sum[:])
}
