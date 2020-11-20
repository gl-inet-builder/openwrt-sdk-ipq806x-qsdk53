"use strict";

define(["vue", "text!temple/bluetooth/list.html", "css!temple/bluetooth/index.css", 'component/gl-btn/index', 'component/gl-loading/index', 'component/gl-input/index', 'component/gl-colorPicker/index', 'component/gl-slider/index'], function (Vue, stpl, css, gl_btn, gl_loading, gl_input, color_picker, gl_slider) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                iProgress: -9,
                scanDone: false, // 蓝牙是否搜索完成
                loading: false,
                connectIndex: 0,
                currMac: '', // 当前设备的mac地址
                scanlist: [], //蓝牙设备列表
                serverlist: [], // 远程设备提供的服务列表
                curserverlist: [],
                getCharlist: false,
                curuuid: '', // 当前选择的uuid
                mipowValue: '',
                mipowLight: 0,
                characteristic_mipow: '',
                page: 'one',
                btnName: 'Disconnect',
                actionStatus: false,
                isOnline: true,
                currDevice: {},
                currentDevice: {},
                currAccess: '',
                connectStatus: false,
                loadingIndex: -1,
                sliderStatus: false,
                setScanError: false,
                handleOperatStatus: false,
                uuidlist:["Generic Access","Alert Notification Service","Automation IO","Battery Service","Blood Pressure","Body Composition","Bond Management Service","Continuous Glucose Monitoring","Current Time Service","Cycling Power","Cycling Speed and Cadence","Device Information","Environmental Sensing","Fitness Machine","Generic Attribute","Glucose","Health Thermometer","Heart Rate","HTTP Proxy","Human Interface Device","Immediate Alert","Indoor Positioning","Insulin Delivery","Internet Protocol Support Service","Link Loss","Location and Navigation","Mesh Provisioning Service","Mesh Proxy Service","Next DST Change Service","Object Transfer Service","Phone Alert Status Service","Pulse Oximeter Service","Reconnection Configuration","Reference Time Update Service","Running Speed and Cadence","Scan Parameters","Transport Discovery","Tx Power","User Data","Weight Scale","Aerobic Heart Rate Lower Limit","Aerobic Heart Rate Upper Limit","Aerobic Threshold","Age","Aggregate","Alert Category ID","Alert Category ID Bit Mask","Alert Level","Alert Notification Control Point","Alert Status","Altitude","Anaerobic Heart Rate Lower Limit","Anaerobic Heart Rate Upper Limit","Anaerobic Threshold","Analog","Analog Output","Apparent Wind Direction","Apparent Wind Speed","Appearance","Barometric Pressure Trend","Battery Level","Battery Level State","Battery Power State","Blood Pressure Feature","Blood Pressure Measurement","Body Composition Feature","Body Composition Measurement","Body Sensor Location","Bond Management Control Point","Bond Management Features","Boot Keyboard Input Report","Boot Keyboard Output Report","Boot Mouse Input Report","Central Address Resolution","CGM Feature","CGM Measurement","CGM Session Run Time","CGM Session Start Time","CGM Specific Ops Control Point","CGM Status","Client Supported Features","Cross Trainer Data","CSC Feature","CSC Measurement","Current Time","Cycling Power Control Point","Cycling Power Feature","Cycling Power Measurement","Cycling Power Vector","Database Change Increment","Database Hash","Date of Birth","Date of Threshold Assessment","Date Time","Date UTC","Day Date Time","Day of Week","Descriptor Value Changed","Device Name","Dew Point","Digital","Digital Output","DST Offset","Elevation","Email Address","Exact Time 100","Exact Time 256","Fat Burn Heart Rate Lower Limit","Fat Burn Heart Rate Upper Limit","Firmware Revision String","First Name","Fitness Machine Control Point","Fitness Machine Feature","Fitness Machine Status","Five Zone Heart Rate Limits","Floor Number","Gender","Glucose Feature","Glucose Measurement","Glucose Measurement Context","Gust Factor","Hardware Revision String","Heart Rate Control Point","Heart Rate Max","Heart Rate Measurement","Heat Index","Height","HID Control Point","HID Information","Hip Circumference","HTTP Control Point","HTTP Entity Body","HTTP Headers","HTTP Status Code","HTTPS Security","Humidity","IDD Annunciation Status","IDD Command Control Point","IDD Command Data","IDD Features","IDD History Data","IDD Record Access Control Point","IDD Status","IDD Status Changed","IDD Status Reader Control Point","IEEE 11073-20601 Regulatory Certification Data List","Indoor Bike Data","Indoor Positioning Configuration","Intermediate Cuff Pressure","Intermediate Temperature","Irradiance","Language","Last Name","Latitude","LN Control Point","LN Feature","Local East Coordinate","Local North Coordinate","Local Time Information","Location and Speed Characteristic","Location Name","Longitude","Magnetic Declination","Magnetic Flux Density - 2D","Magnetic Flux Density - 3D","Manufacturer Name String","Maximum Recommended Heart Rate","Measurement Interval","Model Number String","Navigation","Network Availability","New Alert","Object Action Control Point","Object Changed","Object First-Created","Object ID","Object Last-Modified","Object List Control Point","Object List Filter","Object Name","Object Properties","Object Size","Object Type","OTS Feature","Peripheral Preferred Connection Parameters","Peripheral Privacy Flag","PLX Continuous Measurement Characteristic","PLX Features","PLX Spot-Check Measurement","PnP ID","Pollen Concentration","Position 2D","Position 3D","Position Quality","Pressure","Protocol Mode","Pulse Oximetry Control Point","Rainfall","RC Feature","RC Settings","Reconnection Address","Reconnection Configuration Control Point","Record Access Control Point","Reference Time Information","Removable","Report","Report Map","Resolvable Private Address Only","Resting Heart Rate","Ringer Control point","Ringer Setting","Rower Data","RSC Feature","RSC Measurement","SC Control Point","Scan Interval Window","Scan Refresh","Scientific Temperature Celsius","Secondary Time Zone","Sensor Location","Serial Number String","Service Changed","Service Required","Software Revision String","Sport Type for Aerobic and Anaerobic Thresholds","Stair Climber Data","Step Climber Data","String","Supported Heart Rate Range","Supported Inclination Range","Supported New Alert Category","Supported Power Range","Supported Resistance Level Range","Supported Speed Range","Supported Unread Alert Category","System ID","TDS Control Point","Temperature","Temperature Celsius","Temperature Fahrenheit","Temperature Measurement","Temperature Type","Three Zone Heart Rate Limits","Time Accuracy","Time Broadcast","Time Source","Time Update Control Point","Time Update State","Time with DST","Time Zone","Training Status","Treadmill Data","True Wind Direction","True Wind Speed","Two Zone Heart Rate Limit","Tx Power Level","Uncertainty","Unread Alert Status","URI","User Control Point","User Index","UV Index","VO2 Max","Waist Circumference","Weight","Weight Measurement","Weight Scale Feature","Wind Chill"],
                UUIDNumberlist:["1800","1811","1815","180f","1810","181b","181e","181f","1805","1818","1816","180a","181a","1826","1801","1808","1809","180d","1823","1812","1802","1821","183a","1820","1803","1819","1827","1828","1807","1825","180e","1822","1829","1806","1814","1813","1824","1804","181c","181d","2a7e","2a84","2a7f","2a80","2a5a","2a43","2a42","2a06","2a44","2a3f","2ab3","2a81","2a82","2a83","2a58","2a59","2a73","2a72","2a01","2a3","2a19","2a1b","2a1a","2a49","2a35","2a9b","2a9c","2a38","2a4","2a5","2a22","2a32","2a33","2a6","2a8","2a7","2ab","2a","2ac","2a9","2b29","2ace","2a5c","2a5b","2a2b","2a66","2a65","2a63","2a64","2a99","2b2a","2a85","2a86","2a08","2aed","2a0a","2a09","2a7d","2a00","2a7b","2a56","2a57","2a0d","2a6c","2a87","2a0b","2a0c","2a88","2a89","2a26","2a8a","2ad9","2ac","2ada","2a8b","2ab2","2a8c","2a51","2a18","2a34","2a74","2a27","2a39","2a8d","2a37","2a7a","2a8e","2a4c","2a4a","2a8f","2aba","2ab9","2ab7","2ab8","2ab","2a6f","2b22","2b25","2b26","2b23","2b28","2b27","2b21","2b20","2b24","2a2a","2ad2","2ad","2a36","2a1e","2a77","2a2","2a90","2ae","2a6b","2a6a","2ab1","2ab0","2a0f","2a67","2ab5","2af","2a2c","2a0","2a1","2a29","2a91","2a21","2a24","2a68","2a3e","2a46","2ac5","2ac8","2ac1","2ac3","2ac2","2ac6","2ac7","2abe","2ac4","2ac0","2abf","2abd","2a04","2a02","2a5f","2a60","2a5e","2a50","2a75","2a2f","2a30","2a69","2a6d","2a4e","2a62","2a78","2b1d","2b1e","2a03","2b1f","2a52","2a14","2a3a","2a4d","2a4b","2ac9","2a92","2a40","2a41","2ad1","2a54","2a53","2a55","2a4f","2a31","2a3c","2a10","2a5d","2a25","2a05","2a3b","2a28","2a93","2ad0","2acf","2a3d","2ad7","2ad5","2a47","2ad8","2ad6","2ad4","2a48","2a23","2abc","2a6e","2a1f","2a20","2a1c","2a1d","2a94","2a12","2a15","2a13","2a16","2a17","2a11","2a0e","2ad3","2acd","2a71","2a70","2a95","2a07","2ab4","2a45","2aB6","2a9f","2a9a","2a76","2a96","2a97","2a98","2a9d","2a9e","2a79"]
            };
        },
        created: function created() {
            this.currentDevice = this.$route.params.deviceData;
            if (this.currentDevice) {
                this.currMac = this.currentDevice.mac;
                this.currDevice = this.currentDevice;
                this.page = this.currentDevice.page;
                this.connectIndex = this.currentDevice.connection;
                this.scanDone = true;
                this.characteristic_mipow = this.currentDevice.characteristic;
                this.serverlist = this.$route.params.serverlist;
                this.curserverlist = [];
                this.currAccess = this.currentDevice.address_type;
            } else {
                this.setScanParam();
            }
        },

        computed: {
            // 滚动条宽度
            progressWidth: function progressWidth() {
                return {
                    width: this.iProgress + "%"
                };
            }
        },
        methods: {
            transformer: function transformer(data){
                var item = "UUID: "+ data
                  for (var i = 0; i < this.UUIDNumberlist.length; i++) {
                        if (this.UUIDNumberlist[i].indexOf(data)!= -1) {
                            item = this.uuidlist[i]
                        }                      
                  }
                  return item
            },
            translates: function translates(data) {
                var item = data
                  for (var i = 0; i < this.UUIDNumberlist.length; i++) {
                        if (this.UUIDNumberlist[i].indexOf(data)!= -1) {
                            item = this.uuidlist[i]
                        }                      
                  }
                  return item
            },
            PrefixInteger: function PrefixInteger(num, length) {
                return (num/Math.pow(10,length)).toFixed(length).substr(2);
            },
            systemtranslate: function systemtranslate(data){
                var system = this.PrefixInteger(data.toString(2),8)
                var systemlimits = system.split('')
                var limitsClass = ["Ep","As","I","N","W","Wnr","R","B"];
                var item = []
                for (var i = 0; i < systemlimits.length; i++) {
                    if (systemlimits[i] == '1') {
                        item.push(limitsClass[i])
                    }                    
                }
                return item
            },
            toggle: function toggle() {
                this.page = 'two';
            },
            back: function back() {
                // this.page = 'one'
                this.setScanParam();
            },
            setcharvalue: function setcharvalue(data, index) {
                var that = this;
                this.$store.dispatch('call', {
                    api: 'zbReadchar', data: {
                        connection: this.connectIndex,
                        characteristic: data.char_handle
                    }
                }).then(function (result) {
                    if (result.success) {
                        setTimeout(function () {
                            that.$store.dispatch('call', {
                                api: 'zbGetchar', data: {
                                    mac: that.currMac,
                                    UUID: that.curuuid
                                }
                            }).then(function (target) {
                                if (target.success) {
                                    that.$store.dispatch('call', {
                                        api: 'zbWritechar', data: {
                                            connection: that.connectIndex,
                                            characteristic: target.character_list[index].char_handle,
                                            value_len: target.character_list[index].value_len,
                                            value: data.value
                                        }
                                    }).then(function (item) {
                                        if (item.success) {
                                                that.$message({
                                                    "type": "success",
                                                    "api": "zbWritechar",
                                                    "msg": item.code
                                                });
                                            } else {
                                                that.$message({
                                                    "type": "error",
                                                    "api": "zbWritechar",
                                                    "msg": item.code
                                                });
                                            }
                                    });
                                }else {
                                    that.$message({
                                        type : "error",
                                        msg : result.code
                                    })
                                }
                            });
                        }, 2000);
                    } else {
                        that.$message({
                            type : "error",
                            msg : result.code
                        });
                    }
                });
            },
            wire_mipow: function wire_mipow() {
                var that = this;

                if (this.sliderStatus) return;
                var light = this.mipowLight.toString(16);
                light = light.length == 1 ? '0' + light : light;
                var val = (light + this.mipowValue).split('#').join('');
                this.sliderStatus = true;
                this.$store.dispatch('call', {
                    api: 'zbWrite_mipow', data: {
                        connection: this.connectIndex,
                        characteristic: this.characteristic_mipow,
                        value_len: 4,
                        value: val
                    }
                }).then(function (result) {
                    setTimeout(function () {
                        that.sliderStatus = false;
                    }, 500);
                    if (result.success) {
                        that.$message({
                            type : "success",
                            msg : result.code
                        });
                    }else {
                        that.$message({
                            type : "error",
                            msg : result.code
                        });
                    }
                });
            },
            getChar: function getChar(item, index) {
                var that = this;
                if (this.curserverlist[index]) return;
                this.getCharlist = true;
                this.loadingIndex = index;
                this.curuuid = item.UUID;
                this.$store.dispatch('call', {
                    api: 'zbReadallchar', data: {
                        connection: this.connectIndex,
                        start_handle: item.start_handle,
                        end_handle: item.end_handle
                    }
                }).then(function (result) {
                    if (result.success) {
                        setTimeout(function () {
                            that.$store.dispatch('call', {
                                api: 'zbGetchar', data: {
                                    mac: that.currMac,
                                    UUID: item.UUID
                                }
                            }).then(function (data) {
                                that.curserverlist[index] = data.character_list || [];
                                that.getCharlist = false;
                                if (data.success) {
                                    that.$message({
                                        type : "success",
                                        msg : result.code
                                    });
                                } else {
                                    that.$message({
                                        type : "error",
                                        msg : result.code
                                    });
                                }
                            });
                        }, 2000);
                    }else {
                        that.$message({
                            type : "error",
                            msg : result.code
                        });
                    }
                });
            },
            handleDeviceOperat: function handleDeviceOperat(item, target) {
                if (this.isOnline) {
                    this.Disconnect()
                } else {
                    this.setConnpara(item, target)
                }
            },
            // 断开连接
            Disconnect: function Disconnect() {
                var that = this;
                this.actionStatus = true;
                this.$store.dispatch('call', {
                    api: 'zbgetStatus', data: {
                        connection: this.connectIndex
                    }
                }).then(function (response) {
                    if (response.online) {
                        that.$store.dispatch('call', {
                            api: 'zbDisconnect', data: {
                                connection: that.connectIndex
                            }
                        }).then(function (result) {
                            that.actionStatus = false;
                            if (result.success) {
                                that.isOnline = false;
                                that.$message({
                                    type: 'success',
                                    msg: result.code
                                });
                            }
                        });
                        if (that.serverlist) {
                            for (var key in that.serverlist) {
                                $('#' + that.serverlist[key].id).collapse('hide');
                            }
                        }
                    } else {
                        that.isOnline = false;
                        that.actionStatus = false;
                        that.$message({
                            type: 'warning',
                            msg: '当前设备已离线'
                        });
                    }
                });
            },
            // 设置连接蓝牙参数
            setConnpara: function setConnpara(item, target) {
                this.currDevice = item;
                this.currMac = item.mac;
                target ? this.connectStatus = true : this.loading = true;
                // this.$store.dispatch('call', {
                //     api: 'zbSetconnpara', data: {
                //         min_interval: 40,
                //         max_interval: 80,
                //         latency: 0,
                //         timeout: 400,
                //     }
                // }).then(result => {
                this.connect(item, target);
                // })
            },
            // 连接蓝牙
            connect: function connect(item, target) {
                var that = this;
                this.currDevice = item;
                this.currMac = item.mac;
                this.currAccess = item.address_type;
                target ? this.connectStatus = true : this.loading = true;
                var api = 'zbConnect';
                if (item.manufacturer == 'MIPOW') {
                    api = 'zbConnect_mipow';
                }
                this.$store.dispatch('call', {
                    api: api, data: {
                        address: item.mac,
                        address_type: this.currAccess // 0公共设备 1私密设备
                    }
                }).then(function (result) {
                    if (result.success) {
                        setTimeout(function () {
                            item.manufacturer == 'MIPOW' ? that.getService_mipow(result, target) : that.getService(result, item);
                        }, 1000);
                        that.connectIndex = result.connection;
                    } else {
                        target ? that.connectStatus = false : that.loading = false;
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            // 获取已连接蓝牙设备支持的服务及列表 - mipow
            getService_mipow: function getService_mipow(result, target) {
                var that = this;

                this.$store.dispatch('call', {
                    api: 'zbGetscan_mipow', data: {
                        connection: result.connection,
                        characteristic: result.characteristic
                    }
                }).then(function (response) {
                    that.characteristic_mipow = result.characteristic;
                    that.connectStatus = false;
                    that.loading = false;
                    that.page = 'three';
                    that.isOnline = true;
                    if (response.success) {
                        target ? that.$message({
                            type: 'success',
                            msg: response.code
                        }) : null;
                    }else {
                        that.$message({
                            type : "error",
                            msg : response.code
                        });
                    }
                });
            },
            // 获取已连接蓝牙设备支持的服务及列表
            getService: function getService(result, item) {
                var that = this;

                this.$store.dispatch('call', {
                    api: 'zbPrimary', data: {
                        connection: result.connection
                    }
                }).then(function (result) {
                    if (result.success) {
                        setTimeout(function () {
                            that.$store.dispatch('call', {
                                api: 'zbGetservice', data: {
                                    mac: item.mac
                                }
                            }).then(function (result) {
                                that.serverlist = result.service_list;
                                for (var i in that.serverlist) {
                                    that.serverlist[i].id = 'item' + i;
                                }
                                that.connectStatus = false;
                                that.loading = false;
                                that.page = 'two';
                                that.isOnline = true;
                                if (result.success) {
                                    that.$message({
                                        type : "success",
                                        msg : result.code
                                    });
                                } else {
                                    that.connectStatus = false;
                                    that.loading = false;
                                    that.$message({
                                        type : "error",
                                        msg : result.code
                                    });
                                }
                            });
                        }, 2000);
                    } else {
                        that.connectStatus = false;
                        that.loading = false;
                        that.$message({
                            type: "error",
                            msg: result.code
                        })
                    }
                });
            },
            // 搜索蓝牙前 设置参数
            setScanParam: function setScanParam() {
                var that = this;
                var that = this;
                this.scanDone = false; //重置进度条参数
                this.iProgress = -9; //重置进度条参数
                this.setProgress(); //重置进度条
                that.$store.dispatch('call', {
                    api: 'zbSetscan', data: {
                        scan_interval: 16,
                        scan_window: 16,
                        active: 1
                    }
                }).then(function (result) {
                    if (result.success) {
                        that.startScan();
                    } else {
                        setTimeout(function() {
                            that.setScanError = true;
                        }, 10000);
                        that.$message({
                            type : "error",
                            msg : result.code
                        });
                    }
                });
            },
            // 开始搜索
            startScan: function startScan() {
                var that = this;
                that.$store.dispatch('call', { api: 'zbStartscan' }).then(function (result) {
                    if (result.success) {
                        // setTimeout(function () {
                        //     that.stopScan();
                        // }, 5000);
                        that.$store.dispatch('call', { api: 'zbGetscan' }).then(function (item) {
                            that.isOnline = true;
                            that.page = 'one';
                            that.scanDone = true;
                            that.scanlist = item.scan_result || [];
                        });
                    }else {
                        that.$message({
                            type : "error",
                            msg : result.code
                        });
                    }
                });
            },
            // 停止搜索
            stopScan: function stopScan() {
                var that = this;

                that.$store.dispatch('call', { api: 'zbStopscan' }).then(function (result) {
                    if (result.success) {
                        // 获取列表
                        that.$store.dispatch('call', { api: 'zbGetscan' }).then(function (item) {
                            that.isOnline = true;
                            that.page = 'one';
                            that.scanDone = true;
                            that.scanlist = item.scan_result || [];
                        });
                    }else {
                        that.$message({
                            type : "error",
                            msg : result.code
                        });
                    }
                });
            },
            // 控制滚动条加载进度
            setProgress: function setProgress() {
                var that = this;

                if (!this.scanDone && this.iProgress <= 90) {
                    setTimeout(function () {
                        that.setProgress();
                    }, 400);
                    this.iProgress += parseInt(9);
                }
            }
        },
        components: {
            'gl-btn': gl_btn,
            'gl-loading': gl_loading,
            'gl-input': gl_input,
            "color-picker": color_picker,
            "gl-slider": gl_slider
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            next();
        },

        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                setTimeout(function () {
                    if ($(".clsLink2bluetooth").hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2bluetooth").addClass("active");
                        $("#applications").collapse("hide");
                        $("#moresetting").collapse("hide");
                        $("#system").collapse("show");
                        $("#vpn").collapse("hide");
                    };
                }, 50);
            });
        }
    });
    return vueComponent;
});