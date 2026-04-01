package model

type VisitRequest struct {
	VisitorID string `json:"visitor_id"`
}

type VisitInfo struct {
	VisitorID      string `json:"visitor_id"`
	VisitorOrdinal int    `json:"visitor_ordinal"`
	VisitCount     int    `json:"visit_count"`
	IsFirstVisit   bool   `json:"is_first_visit"`
}
