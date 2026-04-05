package web

import (
	"embed"
	"io/fs"
)

//go:embed all:frontend_dist
var embeddedStatic embed.FS

func StaticFiles() (fs.FS, error) {
	return fs.Sub(embeddedStatic, "frontend_dist")
}
