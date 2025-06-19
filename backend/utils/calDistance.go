// utils/calDistance.go
package utils

import "math"

// 地球半径 (km)
const EarthRadiusKm = 6371.0

func Haversine(lat1, lon1, lat2, lon2 float64) float64 {
	// 将角度转换为弧度
	toRadius := func(deg float64) float64 {
		return deg * math.Pi / 180
	}
	lat1Rad := toRadius(lat1)
	lon1Rad := toRadius(lon1)
	lat2Rad := toRadius(lat2)
	lon2Rad := toRadius(lon2)

	dlat := lat2Rad - lat1Rad
	dlon := lon2Rad - lon1Rad

	a := math.Pow(math.Sin(dlat/2), 2) + math.Cos(lat1Rad)*math.Cos(lat2Rad)*math.Pow(math.Sin(dlon/2), 2)

	c := 2 * math.Asin(math.Sqrt(a))

	distance := math.Round(EarthRadiusKm*c*10) / 10
	return distance
}
