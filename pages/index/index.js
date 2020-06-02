import * as echarts from '../../ec-canvas/echarts';

var chart = null;

function initChart(canvas, width, height, dpr) {
    console.log("调用initChart")
    chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);
    var option = {
        color: ['#61a0a8'],
        grid: [{
            x: '10%', y: '15%', width: '80%', height: '38%'
        }],
        // dataZoom: [
        //     {   // 这个dataZoom组件，默认控制x轴。
        //         type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
        //         start: 10,      // 左边在 10% 的位置。
        //         end: 60         // 右边在 60% 的位置。
        //     }
        // ],
        xAxis: {
            data: []
        },
        yAxis: {},
        series: [{
            type: 'bar',
            data: []
        }, {
            type: 'pie',
            center: ['40%', '80%'],
            radius: 50,
            data: []
        }
        ]
    };
    chart.setOption(option);
    chart.hideLoading();
    return chart;
}

function getCensus(step, size) {
    console.log('step=' + step + ' size=' + size);
    wx.request({
        //发送post请求
        url: 'https://www.caodalinsworld.com:8081/applet/task/census/' + size,
        method: 'POST',
        data: {
            step: 0
        },
        //TODO
        header: {
            "content-type": "application/json",
            "userId": 1
        },
        success: function (res) {
            var data = res.data;
            var arr = [];
            var categories = [];
            var title = '';
            for (var key in data.data) {
                categories.push(key);
                arr.push(data.data[key]);
            }
            title = (size === 'week') ? '周' : '月';
            var option = {
                color: ['#61a0a8', '#c23531'],
                title: {
                    textStyle: {
                        color: '#61a0a8'
                    },
                    text: title + '完成任务数量'
                },
                xAxis: {
                    data: categories,
                },
                yAxis: {
                    name: '完成量'
                },
                series: [{
                    // 根据名字对应到相应的系列
                    data: arr
                }, {
                    data: [
                        {"name": '完成', value: 7},
                        {"name": '未完成', value: 3}
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            }
            chart.setOption(option)
        },
        fail: function (res) {
            console.log(this.url);
        }
    });
}

Page({
    onShareAppMessage: function (res) {
        return {
            title: 'ECharts 可以在微信小程序中使用啦！',
            path: '/pages/index/index',
            success: function () {
            },
            fail: function () {
            }
        }
    },
    data: {
        select: false,
        grain_name: '周记录',
        grain_size: 'week',
        ec: {
            onInit: initChart
        },
        userId: 1,
        canvas_show: true,
        step: 0
    },
    onLoad: function (options) {
        getCensus(0, this.data.grain_size);
    },
    bindShowMsg() {
        this.setData({
            select: !this.data.select,
            canvas_show: true
        })
    },
    //选择粒度显示不同的粒度下的柱状图
    mySelect(e) {
        var size = e.currentTarget.dataset.size
        var name = e.currentTarget.dataset.name;
        this.setData({
            grain_name: name,
            select: false,
            grain_size: size
        });
        wx.showLoading({
            title: '加载中...',
        });
        getCensus(0, size);
        wx.hideLoading();
    },
    last(e) {
        var step = this.data.step - 1;
        var size = this.data.grain_size;
        getCensus(step, size);
        this.setData({
            step: step
        })
    },
    next(e) {
        var step = this.data.step + 1;
        var size = this.data.grain_size;
        getCensus(step, size);
        this.setData({
            step: step
        })
    },
    onReady() {
        setTimeout(function () {
        }, 2000);
    }
});
