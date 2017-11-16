import React from 'react';
import ReactDOM from 'react-dom'
import { Input, message } from 'antd';
import styles from './index.less';

const Search = Input.Search;

class MyMap extends React.Component {
    constructor(props) {
        super(props);
    }
    getCurrentLoc() {
        let geolocation = new BMap.Geolocation();
        let _this = this;
        // 获取当前位置
        geolocation.getCurrentPosition(function (r) {
            if (this.getStatus() === BMAP_STATUS_SUCCESS) {
                message.success('位置获取成功');
                let point = new BMap.Point(r.point.lng, r.point.lat);
                map.centerAndZoom(point, 15);
                let marker = new BMap.Marker(point); // 创建标注
                map.addOverlay(marker); // 将标注添加到地图中
                marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
                // marker.enableDragging();     // 允许拖动标记

                // 右键点击删除
                let removeMarker = function (e, ee, marker) {
                    map.removeOverlay(marker);
                }
                let markerMenu = new BMap.ContextMenu();
                markerMenu.addItem(new BMap.MenuItem('删除', removeMarker.bind(marker)));
                marker.addContextMenu(markerMenu);

                // marker.addEventListener("dragend", function (e) {
                //     console.log("当前位置：" + e.point.lng + ", " + e.point.lat);
                // })

                _this.props.dispatch({
                    type: 'map/curLoc',
                    payload: {
                        curPos: {
                            lng: r.point.lng,
                            lat: r.point.lat,
                            address: r.address.city
                        }
                    }
                })
            } else {
                message.error('位置获取失败');
            }
        });
    }
    searchLoc(val) {
        if (val !== '') {
            //搜索
            let local = new BMap.LocalSearch(map, {
                renderOptions: { map: map }
            });
            local.search(val);
            let _this = this;
            setTimeout(function () {
                _this.props.dispatch({
                    type: "map/search",
                    payload: {
                        position: {
                            lng: local.yd.vC.lng,
                            lat: local.yd.vC.lat,
                            address: val
                        }
                    }
                })
            }, 0);
        } else {
            message.warning('请输入');
        }
    }
    componentDidMount() {
        let _this=this;
        let BMap = window.BMap;
        const { lng, lat} = this.props.map.position;
        window.map = new BMap.Map('map');
        let point = new BMap.Point(lng, lat);
        map.centerAndZoom(point, 12);
        map.enableScrollWheelZoom(true);     // 滚轮缩放
        map.addControl(new BMap.NavigationControl());   // 地图平移缩放
        map.addControl(new BMap.ScaleControl());        // 地图的比例关系
        map.addControl(new BMap.OverviewMapControl());  // 可折叠缩略地图
        map.addControl(new BMap.MapTypeControl());      // 地图类型
        this.getCurrentLoc();
        // 搜索框
        //建立一个自动完成的对象
        let ac = new BMap.Autocomplete({
            "input": "search", 
            "location": map
        });
        ac.addEventListener("onhighlight", function (e) {  //鼠标放在下拉列表上的事件
            let str = "";
            let _value = e.fromitem.value;
            let value = "";
            if (e.fromitem.index > -1) {
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;
    
            value = "";
            if (e.toitem.index > -1) {
                _value = e.toitem.value;
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
            ac.data_value = str;
        });
        let myValue;
        ac.addEventListener("onconfirm", function (e) {    //鼠标点击下拉列表后的事件
            let _value = e.item.value;
            myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
            // ac.data_value = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
            setPlace();
        });
        function setPlace() {
            map.clearOverlays();    //清除地图上所有覆盖物
            function myFun() {
                let pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
                _this.props.dispatch({
                    type: "map/search",
                    payload: {
                        position: {
                            lng: pp.lng,
                            lat: pp.lat,
                            address: myValue
                        }
                    }
                })
                map.centerAndZoom(pp, 18);
                map.addOverlay(new BMap.Marker(pp));    //添加标注
            }
            let local = new BMap.LocalSearch(map, { //智能搜索
                onSearchComplete: myFun
            });
            local.search(myValue);
        }
        // 单击地图使输入框失去焦点
        map.addEventListener('click',(e)=>{
            ReactDOM.findDOMNode(_this.refs.inputSearch).getElementsByTagName('input')[0].blur();
        });
        map.addEventListener('dragend',(e)=>{
            ReactDOM.findDOMNode(_this.refs.inputSearch).getElementsByTagName('input')[0].blur();
        });
        map.addEventListener('touchend',(e)=>{
            ReactDOM.findDOMNode(_this.refs.inputSearch).getElementsByTagName('input')[0].blur();
        });
    }
    render() {
        return (
            <div className={styles.normal}>
                <Search
                    placeholder="输入地址"
                    className={styles.search}
                    id="search"
                    onSearch={value => this.searchLoc(value)}
                    ref="inputSearch"
                />
                <div id="map" className={styles.myMap}></div>
            </div>
        );
    }
}

export default MyMap;