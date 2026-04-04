package blog

import (
	"errors"
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// TagConfig controls tag validation behavior.
type TagConfig struct {
	WhitelistEnabled        bool     `yaml:"whitelist_enabled"`
	StrictContentValidation bool     `yaml:"strict_content_validation"`
	AllowedTags             []string `yaml:"allowed_tags"`
}

func DefaultTagConfig() TagConfig {
	return TagConfig{
		WhitelistEnabled:        true,
		StrictContentValidation: true,
		AllowedTags: []string{
			"go",
			"react",
			"markdown",
			"japanese",
			"english",
			"math",
			"algorithms",
			"tooling",
		},
	}
}

func LoadTagConfig(path string) (TagConfig, error) {
	config := DefaultTagConfig()

	content, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return config, nil
		}
		return TagConfig{}, fmt.Errorf("read tag config failed: %w", err)
	}

	if unmarshalErr := yaml.Unmarshal(content, &config); unmarshalErr != nil {
		return TagConfig{}, fmt.Errorf("parse tag config failed: %w", unmarshalErr)
	}

	if len(config.AllowedTags) == 0 && config.WhitelistEnabled {
		return TagConfig{}, errors.New("tag whitelist is enabled but allowed_tags is empty")
	}

	return config, nil
}
