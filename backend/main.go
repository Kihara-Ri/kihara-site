package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
)

// 接收外部API返回结果
type IPAPIResponse struct {
	IP          string  `json:"ip"`
	CountryName string  `json:"country_name"`
	RegionName  string  `json:"region_name"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	IsProxy     bool    `json:"is_proxy"`
}

// 内部API前端显示
type IPInfo struct {
	IP       string `json:"ip"`
	Location string `json:"location"`
}

func getClientIP(r *http.Request) string {
	ip := r.Header.Get("X-Forwarder-For")
	if ip != "" {
		return ip
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func ipInfoHandler(w http.ResponseWriter, r *http.Request) {
	ip := getClientIP(r)
	// ip := "126.65.210.162"
	fmt.Println("访问IP API: ", ip)
	// 请求API
	// "https://api.ip2location.io/?key=548A2DB34D7D8FAEF8409EF396739597&ip=126.65.210.162"
	apiURL := fmt.Sprintf("https://api.ip2location.io/?key=548A2DB34D7D8FAEF8409EF396739597&ip=%s", ip)
	resp, err := http.Get(apiURL)
	if err != nil {
		http.Error(w, "无法获取地理信息", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var data IPAPIResponse
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		http.Error(w, "解析地理信息失败", http.StatusInternalServerError)
		return
	}

	info := IPInfo{
		IP:       ip,
		Location: fmt.Sprintf("%s %s", data.CountryName, data.RegionName),
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(info)
}

func main() {
	http.HandleFunc("/api/ipinfo", ipInfoHandler)
	fmt.Println("后端服务已启动: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
