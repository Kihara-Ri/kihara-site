package repository

import "time"

// History 对应表 histories
type History struct {
	ID          string    `gorm:"primaryKey;type:uuid"`
	Type        string    `gorm:"type:varchar(10)"` // "问答" / "翻译"
	Question    string    `gorm:"type:text"`
	Answer      string    `gorm:"type:text"`
	FromLang    string    `gorm:"type:char(2)"`
	ToLang      string    `gorm:"type:char(2)"`
	Enhancement string    `gorm:"type:varchar(20)"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}

// Save 一条历史
func Save(h *History) error {
	return DB.Create(h).Error
}

// List 最近 n 条
func List(limit int) ([]History, error) {
	var hs []History
	err := DB.Order("created_at desc").Limit(limit).Find(&hs).Error
	return hs, err
}
