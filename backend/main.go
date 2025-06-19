package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"

	"kihara.cn/personal-site/logger"
	"kihara.cn/personal-site/utils"
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
	IP          string  `json:"ip"`
	Location    string  `json:"location"`
	CountryName string  `json:"country_name"`
	Distance    float64 `json:"distance"`
}

const myLatitude = 35.70798
const myLontitude = 139.84298

func getClientIP(r *http.Request) string {
	// Nginx 传递的真实客户端 IP
	ip := r.Header.Get("X-Forwarded-For")
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
	// ip := getClientIP(r)
	ip := r.URL.Query().Get("ip")
	if ip == "" {
		ip = getClientIP(r)
	}
	fmt.Println("访问IP API: ", ip)

	// 日志记录
	userAgent := r.UserAgent()
	logger.LogAccess(ip, userAgent, "访问 /api/ipinfo")

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

	// 计算距离
	distance := utils.Haversine(myLatitude, myLontitude, data.Latitude, data.Longitude)

	info := IPInfo{
		IP:          ip,
		Location:    fmt.Sprintf("%s %s", data.CountryName, data.RegionName),
		CountryName: data.CountryName,
		Distance:    distance,
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
