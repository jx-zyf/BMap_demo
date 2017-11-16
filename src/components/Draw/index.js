import React from 'react';
import { Button } from 'antd';
import styles from './index.less';
import mapUtil from '../../utils/mapUtil'

class Draw extends React.Component {

    componentDidMount() {
        // 百度地图API功能
        var map = new BMap.Map('map');
        var point = new BMap.Point(116.404, 39.915);
        map.centerAndZoom(point, 15);
        map.enableScrollWheelZoom();
        var overlays = [];
        var points = [];
        var inSide = [], outSide = [];
        var overlaycomplete = function (e) {
            // console.log(e);
            // console.log(e.overlay.po);// 画矩形时四个点的经纬度，0,1,2,3分别是左上,右上,右下,左下
            overlays.push(e.overlay);

            // test
            // 画点
            if (e.drawingMode === "marker") {
                // 深复制 点 对象
                function extendDeep(sup,sub){
                    var i,
                    toStr=Object.prototype.toString,
                    aStr="[object Array]";
                    sub=sub||{};
                    for(i in sup){
                        if (typeof sup[i]==='object') {
                            sub[i]=toStr.call(sup[i])===aStr?[]:{};
                            extendDeep(sup[i],sub[i]);
                        }else{
                            sub[i]=sup[i];
                        }
                    }
                    return sub;
                }
                var p=extendDeep(e.overlay.point);
                points.push(p);

                // 添加point右键菜单删除
                var marker = e.overlay;
                var removeMarker = function (e, ee, marker) {
                    map.removeOverlay(marker);
                    points.splice(points.indexOf(marker.point), 1);
                    console.log(points);
                }
                var markerMenu = new BMap.ContextMenu();
                markerMenu.addItem(new BMap.MenuItem('删除', removeMarker.bind(marker)));
                marker.addContextMenu(markerMenu);
            }
            console.log(points);
            // 矩形
            if (e.drawingMode === "rectangle") {
                var rec = e.overlay.po;
                points.forEach((v) => {
                    if (mapUtil.isPointInRect(v, rec)) {
                        inSide.push(v);
                    } else {
                        outSide.push(v);
                    }
                });
                console.log(inSide, outSide);
            }
            // 圆
            if (e.drawingMode === "circle") {
                points.forEach((v) => {
                    if(mapUtil.isPointInCircle(v, e.overlay)){
                        inSide.push(v);
                    } else {
                        outSide.push(v);
                    }
                });
                console.log(inSide, outSide);
            }
            // 多边形
            if (e.drawingMode === "polygon") {
                points.forEach((v) => {
                    if (mapUtil.isPointInPolygon(v, e.overlay)) {
                        inSide.push(v);
                    } else {
                        outSide.push(v);
                    }
                });
                console.log(inSide, outSide);
            }
        };

        var styleOptions = {
            strokeColor: "red",    //边线颜色。
            fillColor: "red",      //填充颜色。当参数为空时，圆形将没有填充效果。
            strokeWeight: 1,       //边线的宽度，以像素为单位。
            strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
            fillOpacity: 0.5,      //填充的透明度，取值范围0 - 1。
            strokeStyle: 'solid'    //边线的样式，solid或dashed。
        }
        //实例化鼠标绘制工具
        var drawingManager = new BMapLib.DrawingManager(map, {
            isOpen: false, //是否开启绘制模式
            enableDrawingTool: true, //是否显示工具栏
            drawingToolOptions: {
                anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
                offset: new BMap.Size(5, 5), //偏离值
            },
            circleOptions: styleOptions, //圆的样式
            polylineOptions: styleOptions, //线的样式
            polygonOptions: styleOptions, //多边形的样式
            rectangleOptions: styleOptions //矩形的样式
        });
        //添加鼠标绘制工具监听事件，用于获取绘制结果
        drawingManager.addEventListener('overlaycomplete', overlaycomplete);
        
        // 清除所有标注
        // function clearAll() {
        //     for (var i = 0; i < overlays.length; i++) {
        //         map.removeOverlay(overlays[i]);
        //     }
        //     overlays.length = 0
        // }

        // 地图右键菜单
        var menu = new BMap.ContextMenu();
        var txtMenuItem = [
            {
                text: '放大',
                callback: function () { map.zoomIn() }
            },
            {
                text: '缩小',
                callback: function () { map.zoomOut() }
            }
        ];
        for (var i = 0; i < txtMenuItem.length; i++) {
            menu.addItem(new BMap.MenuItem(txtMenuItem[i].text, txtMenuItem[i].callback, 100));
        }
        map.addContextMenu(menu);
    }

    render(){
        return(
            <div className = { styles.normal } >
                <div id="map" className={styles.mymap}></div>
            </div>
        );
    }
}

export default Draw;