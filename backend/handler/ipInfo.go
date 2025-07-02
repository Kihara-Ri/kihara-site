package handler

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"

	"kihara.cn/personal-site/logger"
	"kihara.cn/personal-site/model"
	"kihara.cn/personal-site/utils"
)

const myLatitude = 35.70798
const myLongitude = 139.84298

// IpInfoHandler 处理 GET /api/info
func IpInfoHandler(w http.ResponseWriter, r *http.Request) {
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

	var data model.IPResponse
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		http.Error(w, "解析地理信息失败", http.StatusInternalServerError)
		return
	}

	// 计算距离
	distance := utils.Haversine(myLatitude, myLongitude, data.Latitude, data.Longitude)

	info := model.IPInfo{
		IP:          ip,
		Location:    fmt.Sprintf("%s %s", data.CountryName, data.RegionName),
		CountryName: data.CountryName,
		Distance:    distance,
		Latitude:    data.Latitude,
		Longtitude:  data.Longitude,
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(info)
}

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
