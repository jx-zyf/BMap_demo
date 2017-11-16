
export default {
    // 判断一个坐标是否在矩形内
    isPointInRect(point, rec) {
        // 计算该矩形经纬度的范围
        var lng_l, lng_h, lat_l, lat_h;
        lng_l = rec[0].lng > rec[1].lng ? rec[1].lng : rec[0].lng;
        lng_h = rec[0].lng < rec[1].lng ? rec[1].lng : rec[0].lng;
        lat_l = rec[0].lat > rec[3].lat ? rec[3].lat : rec[0].lat;
        lat_h = rec[0].lat < rec[3].lat ? rec[3].lat : rec[0].lat;
        if (point.lng >= lng_l && point.lng <= lng_h && point.lat >= lat_l && point.lat <= lat_h) {
            return true;
        } else {
            return false;
        }
    },
    // 判断一个坐标是否在圆内
    isPointInCircle(point, circle) {
        var c = circle.getCenter();
        var r = circle.getRadius();
        var dis = getDistance(point.lat, point.lng, c.lat, c.lng);
        if (dis <= r) {
            return true;
        } else {
            return false;
        }
    },
    // 判断一个坐标是否在多边形内
    isPointInPolygon(point, polygon) {
        //首先判断点是否在多边形的外包矩形内，如果在，则进一步判断，否则返回false
        var polygonBounds = polygon.getBounds();
        // console.log(polygonBounds)
        if (!(point.lng>=polygonBounds.Ll.lng&&point.lng<=polygonBounds.ul.lng&&point.lat>=polygonBounds.Ll.lat&&point.lat<=polygonBounds.ul.lat)) {
            return false;
        }

        var pts = polygon.getPath();//获取多边形点

        //下述代码来源：http://paulbourke.net/geometry/insidepoly/，进行了部分修改
        //基本思想是利用射线法，计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则
        //在多边形内。还会考虑一些特殊情况，如点在多边形顶点上，点在多边形边上等特殊情况。

        var N = pts.length;
        var boundOrVertex = true; //如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
        var intersectCount = 0;//cross points count of x
        var precision = 2e-10; //浮点类型计算时候与0比较时候的容差
        var p1, p2;//neighbour bound vertices
        var p = point; //测试点

        p1 = pts[0];//left vertex
        for (var i = 1; i <= N; ++i) {//check all rays
            if (p.equals(p1)) {
                return boundOrVertex;//p is an vertex
            }

            p2 = pts[i % N];//right vertex
            if (p.lat < Math.min(p1.lat, p2.lat) || p.lat > Math.max(p1.lat, p2.lat)) {//ray is outside of our interests
                p1 = p2;
                continue;//next ray left point
            }

            if (p.lat > Math.min(p1.lat, p2.lat) && p.lat < Math.max(p1.lat, p2.lat)) {//ray is crossing over by the algorithm (common part of)
                if (p.lng <= Math.max(p1.lng, p2.lng)) {//x is before of ray
                    if (p1.lat == p2.lat && p.lng >= Math.min(p1.lng, p2.lng)) {//overlies on a horizontal ray
                        return boundOrVertex;
                    }

                    if (p1.lng == p2.lng) {//ray is vertical
                        if (p1.lng == p.lng) {//overlies on a vertical ray
                            return boundOrVertex;
                        } else {//before ray
                            ++intersectCount;
                        }
                    } else {//cross point on the left side
                        var xinters = (p.lat - p1.lat) * (p2.lng - p1.lng) / (p2.lat - p1.lat) + p1.lng;//cross point of lng
                        if (Math.abs(p.lng - xinters) < precision) {//overlies on a ray
                            return boundOrVertex;
                        }

                        if (p.lng < xinters) {//before ray
                            ++intersectCount;
                        }
                    }
                }
            } else {//special case when ray is crossing through the vertex
                if (p.lat == p2.lat && p.lng <= p2.lng) {//p crossing over p2
                    var p3 = pts[(i + 1) % N]; //next vertex
                    if (p.lat >= Math.min(p1.lat, p3.lat) && p.lat <= Math.max(p1.lat, p3.lat)) {//p.lat lies between p1.lat & p3.lat
                        ++intersectCount;
                    } else {
                        intersectCount += 2;
                    }
                }
            }
            p1 = p2;//next ray left point
        }

        if (intersectCount % 2 == 0) {//偶数在多边形外
            return false;
        } else { //奇数在多边形内
            return true;
        }
    }
}

// 计算地图上两点间的实际距离
function getDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    return s * 1000
};
